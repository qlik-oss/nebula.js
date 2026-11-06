import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';

import build from '../lib/build.js';

// objects created in a vm sandbox have the prototypes of another realm, compare them as plain data
const plain = (value) => JSON.parse(JSON.stringify(value));

const originalCwd = process.cwd();
const originalLog = console.log;
const originalWarn = console.warn;
const originalTime = console.time;
const originalTimeEnd = console.timeEnd;

let root;
let dir;
let counter = 0;

const write = (name, content) => {
  const file = path.join(dir, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

// a project the way `nebula create` lays it out, plus a stand-in for the stardust peer so bundles can be loaded
const createProject = ({ pkg = {}, files = {} } = {}) => {
  counter += 1;
  dir = path.join(root, `project-${counter}`);
  fs.mkdirSync(dir, { recursive: true });
  write(
    'package.json',
    JSON.stringify({
      name: '@acme/viz',
      version: '2.3.4',
      license: 'MIT',
      author: 'Acme <dev@acme.test>',
      module: 'dist/viz.esm.js',
      systemjs: 'dist/viz.systemjs.js',
      peerDependencies: { '@nebula.js/stardust': '*' },
      ...pkg,
    })
  );
  write(
    'node_modules/@nebula.js/stardust/package.json',
    JSON.stringify({ name: '@nebula.js/stardust', version: '0.0.0', main: 'index.js', type: 'module' })
  );
  write('node_modules/@nebula.js/stardust/index.js', 'export const useElement = () => ({ innerHTML: "" });\n');
  write(
    'src/index.js',
    `import { useElement } from '@nebula.js/stardust';
export default function supernova() {
  return { component() { useElement(); }, flag: process.env.NODE_ENV };
}
`
  );
  Object.entries(files).forEach(([name, content]) => write(name, content));
  return dir;
};

const run = (options = {}) => build({ cwd: dir, ...options });

// stand-ins for what the host page provides
const stardust = { useElement: () => ({}) };
const documentStub = () => {
  const nodes = [];
  const doc = {
    head: { appendChild: (n) => nodes.push(n) },
    getElementsByTagName: () => [doc.head],
    querySelector: () => doc.head,
    createElement: () => {
      const n = { style: {}, childNodes: [], appendChild: (c) => n.childNodes.push(c), styleSheet: null };
      Object.defineProperty(n, 'textContent', { get: () => n.childNodes.map((c) => c.data).join('') });
      return n;
    },
    createTextNode: (data) => ({ data }),
  };
  return { doc, css: () => nodes.map((n) => n.textContent.replace(/\s+/g, ' ').trim()) };
};

// what the host page of an es module bundle has: a document, when it has one
let loaded = 0;
const loadEsm = async (file, { document, skip = false } = {}) => {
  const code = fs.readFileSync(path.join(dir, file), 'utf8');
  // the modules that the bundle imports by name, the externals
  const required = [...code.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)].map((m) => m[1]);
  if (skip) {
    return { required };
  }
  const had = Object.getOwnPropertyDescriptor(globalThis, 'document');
  if (document !== undefined || !('document' in globalThis)) {
    Object.defineProperty(globalThis, 'document', { value: document, configurable: true, writable: true });
  }
  try {
    loaded += 1;
    const raw = await import(`${pathToFileURL(path.join(dir, file))}?${loaded}`);
    return { exports: 'default' in raw ? raw.default : raw, raw, required };
  } finally {
    if (had) {
      Object.defineProperty(globalThis, 'document', had);
    } else {
      delete globalThis.document;
    }
  }
};

const loadSystem = (file) => {
  let registered;
  const exported = {};
  const sandbox = {
    System: {
      register: (deps, factory) => {
        registered = { deps, factory };
      },
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(dir, file), 'utf8'), sandbox, { filename: file });
  const mod = registered.factory((a, b) => {
    if (typeof a === 'string') {
      exported[a] = b;
    } else {
      Object.assign(exported, a);
    }
  }, {});
  (mod.setters || []).forEach(
    (setter, i) => setter && setter(registered.deps[i] === '@nebula.js/stardust' ? stardust : {})
  );
  mod.execute();
  return { deps: registered.deps, exported };
};

describe('nebula build', () => {
  before(() => {
    root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nebula-build-')));
    // keep the test output readable
    console.log = () => {};
    console.warn = () => {};
    console.time = () => {};
    console.timeEnd = () => {};
  });

  after(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.time = originalTime;
    console.timeEnd = originalTimeEnd;
    process.chdir(originalCwd);
    fs.rmSync(root, { recursive: true, force: true });
  });

  beforeEach(() => {
    createProject();
    process.chdir(dir);
  });

  describe('output', () => {
    it('writes an esm and a systemjs bundle with source maps and a banner', async () => {
      await run();

      ['dist/viz.esm.js', 'dist/viz.esm.js', 'dist/viz.systemjs.js'].forEach((file) => {
        assert.ok(fs.existsSync(path.join(dir, file)), file);
        assert.ok(fs.existsSync(path.join(dir, `${file}.map`)), `${file}.map`);
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        assert.match(
          content,
          /^\/\*\n\* @acme\/viz v2\.3\.4\n\* Copyright \(c\) \d{4} Acme <dev@acme\.test>\n\* Released under the MIT license\.\n\*\//
        );
        assert.match(content, new RegExp(`//# sourceMappingURL=${path.basename(file)}\\.map\\s*$`));
      });
    });

    it('extracts the notices of the licenses of the source and its dependencies when minifying', async () => {
      write('node_modules/dep/package.json', JSON.stringify({ name: 'dep', main: 'index.js' }));
      write('node_modules/dep/index.js', '/** @license MIT dep */\nmodule.exports = { double: (n) => n * 2 };\n');
      write(
        'src/index.js',
        `/*! Copyright Acme, kept */
import { double } from 'dep';
export default () => double(21);
`
      );
      await run();
      const code = fs.readFileSync(path.join(dir, 'dist/viz.esm.js'), 'utf8');
      assert.ok(code.startsWith('/*\n* @acme/viz v2.3.4'), 'the banner is first');
      assert.ok(code.includes('viz.esm.js.LICENSE.txt'), 'the bundle points at the notices');
      const notices = fs.readFileSync(path.join(dir, 'dist/viz.esm.js.LICENSE.txt'), 'utf8');
      ['Copyright Acme, kept', '@license MIT dep'].forEach((notice) => {
        assert.equal(notices.split(notice).length - 1, 1, `${notice} appears once`);
      });
      assert.equal((await loadEsm('dist/viz.esm.js')).exports(), 42);

      // a development build is not minified, the comments stay where they are
      await run({ mode: 'development' });
      assert.equal(fs.readFileSync(path.join(dir, 'dist/viz.esm.js'), 'utf8').split('@license MIT dep').length - 1, 1);
    });

    it('extracts a notice that follows a string containing the start of a comment', async () => {
      write('node_modules/dep/package.json', JSON.stringify({ name: 'dep', main: 'index.js' }));
      write(
        'node_modules/dep/index.js',
        `var path = "/data/*";
/*! dep v1.0.0 Copyright Dep Authors */
module.exports = { double: function (n) { return n * 2 + path.length - 7; } };
`
      );
      write('src/index.js', "import { double } from 'dep';\nexport default () => double(21);\n");
      await run();
      const notices = fs.readFileSync(path.join(dir, 'dist/viz.esm.js.LICENSE.txt'), 'utf8');
      assert.equal(notices.split('dep v1.0.0 Copyright Dep Authors').length - 1, 1);
      assert.equal((await loadEsm('dist/viz.esm.js')).exports(), 42);
    });

    it('extracts the notices written as /**! and @cc_on as well', async () => {
      write('node_modules/dep/package.json', JSON.stringify({ name: 'dep', main: 'index.js' }));
      write(
        'node_modules/dep/index.js',
        '/**! dep Copyright Dep Authors */\n/* @cc_on kept */\nmodule.exports = { double: function (n) { return n * 2; } };\n'
      );
      write('src/index.js', "import { double } from 'dep';\nexport default () => double(21);\n");
      await run();
      const notices = fs.readFileSync(path.join(dir, 'dist/viz.esm.js.LICENSE.txt'), 'utf8');
      ['dep Copyright Dep Authors', '@cc_on kept'].forEach((notice) =>
        assert.equal(notices.split(notice).length - 1, 1)
      );
    });

    it('extracts the notices written as line comments', async () => {
      write('node_modules/dep/package.json', JSON.stringify({ name: 'dep', main: 'index.js' }));
      write(
        'node_modules/dep/index.js',
        '// @license MIT line dep\nmodule.exports = { double: function (n) { return n * 2; } };\n'
      );
      write('src/index.js', "import { double } from 'dep';\nexport default () => double(21);\n");
      await run();
      assert.match(fs.readFileSync(path.join(dir, 'dist/viz.esm.js.LICENSE.txt'), 'utf8'), /@license MIT line dep/);
    });

    it('maps to the sources only, not to the bundle that was compressed', async () => {
      write('src/index.js', "export default () => 'mapped-marker';\n");
      await run();
      const { sources } = JSON.parse(fs.readFileSync(path.join(dir, 'dist/viz.esm.js.map'), 'utf8'));
      assert.ok(sources.length > 0);
      assert.ok(!sources.some((source) => /(^|\/)viz\.js$/.test(source)), sources.join(', '));
    });

    it('names the sources by the package in the source map', async () => {
      await run();
      const map = JSON.parse(fs.readFileSync(path.join(dir, 'dist/viz.esm.js.map'), 'utf8'));
      assert.ok(map.sources.includes('webpack://@acme/viz/./src/index.js'), map.sources.join(', '));
    });

    it('skips the source maps with sourcemap: false', async () => {
      await run({ sourcemap: false });
      assert.equal(fs.existsSync(path.join(dir, 'dist/viz.esm.js.map')), false);
      assert.doesNotMatch(fs.readFileSync(path.join(dir, 'dist/viz.esm.js'), 'utf8'), /sourceMappingURL/);
    });

    it('skips the esm bundle when package.json has no module and the systemjs bundle with systemjs: false', async () => {
      createProject({ pkg: { module: undefined } });
      process.chdir(dir);
      await run();
      assert.ok(fs.existsSync(path.join(dir, 'dist/viz.systemjs.js')));
      assert.equal(fs.existsSync(path.join(dir, 'dist/viz.esm.js')), false);
      fs.rmSync(path.join(dir, 'dist'), { recursive: true });
      await assert.rejects(run({ systemjs: false }), /Nothing to build/);
    });

    it('minifies in production and leaves the code readable in development', async () => {
      await run();
      const minified = fs.readFileSync(path.join(dir, 'dist/viz.esm.js'), 'utf8').split('\n').length;
      await run({ mode: 'development' });
      const readable = fs.readFileSync(path.join(dir, 'dist/viz.esm.js'), 'utf8').split('\n').length;
      assert.ok(readable > minified * 3, `${readable} lines in development, ${minified} in production`);
    });

    it('builds the esm bundle into the core package', async () => {
      write('core/package.json', JSON.stringify({ name: '@acme/core', module: 'esm/core.js' }));
      await run({ core: 'core' });
      assert.ok(fs.existsSync(path.join(dir, 'core/esm/core.js')));
    });
  });

  describe('esm and systemjs', () => {
    it('exports the properties of a commonjs entry as named exports of the systemjs bundle', async () => {
      write('src/index.js', 'module.exports = { named: 1, run() { return "run"; } };\n');
      await run();
      const { exported } = loadSystem('dist/viz.systemjs.js');
      assert.equal(exported.named, 1);
      assert.equal(exported.run(), 'run');
    });

    it('builds from a relative cwd', async () => {
      await build({ cwd: path.relative(process.cwd(), dir) });
      assert.ok(fs.existsSync(path.join(dir, 'dist/viz.esm.js')));
    });

    it('has the supernova as the default export of the esm bundle', async () => {
      await run();
      const mod = await import(pathToFileURL(path.join(dir, 'dist/viz.esm.js')));
      assert.deepEqual(Object.keys(mod), ['default']);
      assert.equal(typeof mod.default().component, 'function');
    });

    it('registers the systemjs bundle with the stardust dependency and the default export', async () => {
      await run();
      const { deps, exported } = loadSystem('dist/viz.systemjs.js');
      assert.deepEqual(plain(deps), ['@nebula.js/stardust']);
      assert.equal(typeof exported.default, 'function');
    });
  });

  describe('source', () => {
    it('replaces process.env.NODE_ENV and the replacementStrings', async () => {
      write(
        'src/index.js',
        `export default function supernova() { return { env: process.env.NODE_ENV, version: __VERSION__, flag: process.env.FLAG }; }\n`
      );
      await run({
        replacementStrings: { __VERSION__: JSON.stringify('2.3.4'), 'process.env.FLAG': JSON.stringify('on') },
      });
      assert.deepEqual(plain((await loadEsm('dist/viz.esm.js')).exports()), {
        env: 'production',
        version: '2.3.4',
        flag: 'on',
      });
      await run({ mode: 'development', replacementStrings: { __VERSION__: '"x"', 'process.env.FLAG': '"y"' } });
      assert.equal((await loadEsm('dist/viz.esm.js')).exports().env, 'development');
    });

    it('reads json files', async () => {
      write('src/data.json', '{ "answer": 42 }');
      write('src/index.js', `import data from './data.json';\nexport default () => data.answer;\n`);
      await run();
      assert.equal((await loadEsm('dist/viz.esm.js')).exports(), 42);
    });

    it('turns jsx and modern syntax into what the browserslist targets support', async () => {
      write('node_modules/react/package.json', JSON.stringify({ name: 'react', main: 'index.js' }));
      write('node_modules/react/index.js', 'module.exports = { useState: (v) => [v] };\n');
      write(
        'node_modules/react/jsx-runtime.js',
        'exports.jsx = (type, props) => ({ type, props });\nexports.jsxs = exports.jsx;\n'
      );
      write('src/Comp.jsx', 'export default ({ label }) => <span className="c">{label}</span>;\n');
      write(
        'src/index.js',
        `import Comp from './Comp.jsx';
export default () => ({ el: Comp({ label: 'hi' }), spread: { ...{ a: 1 }, b: 2 }, optional: ({})?.x?.y ?? 'none' });
`
      );
      await run();
      const out = plain((await loadEsm('dist/viz.esm.js')).exports());
      assert.deepEqual(out.el, { type: 'span', props: { className: 'c', children: 'hi' } });
      assert.deepEqual(out.spread, { a: 1, b: 2 });
      assert.equal(out.optional, 'none');
    });

    it('builds typescript with the typescript option', async () => {
      write('src/types.ts', 'export interface Options { n: number }\nexport enum Kind { A = "a" }\n');
      write(
        'src/index.ts',
        `import type { Options } from './types';
import { Kind } from './types';
const opts: Options = { n: 2 };
export default function supernova(): { n: number; kind: string } { return { n: opts.n, kind: Kind.A }; }
`
      );
      fs.rmSync(path.join(dir, 'src/index.js'));
      await run({ typescript: true });
      assert.deepEqual(plain((await loadEsm('dist/viz.esm.js')).exports()), { n: 2, kind: 'a' });
    });

    it('fails when an import cannot be resolved', async () => {
      write('src/index.js', `import qlik from 'qlik';\nexport default () => typeof qlik;\n`);
      await assert.rejects(run(), /qlik/);
    });

    it('keeps the peer dependencies as they are, a dependency of the bundle', async () => {
      write('src/index.js', `import qlik from 'qlik';\nexport default () => typeof qlik;\n`);
      write(
        'package.json',
        JSON.stringify({
          name: '@acme/viz',
          version: '2.3.4',
          module: 'dist/viz.esm.js',
          peerDependencies: { qlik: '*' },
        })
      );
      await run();
      assert.ok((await loadEsm('dist/viz.esm.js', { skip: true })).required.includes('qlik'));
    });

    it('makes an empty module of a node builtin, unless a package of that name is installed', async () => {
      write('src/index.js', `import { join } from 'path';\nexport default () => typeof join;\n`);
      await run();
      const { exports, required } = await loadEsm('dist/viz.esm.js', { node: true });
      assert.deepEqual(plain(required), []);
      assert.equal(exports(), 'undefined');

      write('node_modules/path/package.json', JSON.stringify({ name: 'path', main: 'index.js' }));
      write('node_modules/path/index.js', `exports.join = (a, b) => \`\${a}+\${b}\`;\n`);
      await run();
      assert.equal((await loadEsm('dist/viz.esm.js')).exports(), 'function');
    });

    it('does not make a dependency of the bundle of a node builtin that code for node reaches for', async () => {
      // random-js and @qlik/api, dependencies of real visualizations, have require('crypto') and import('fs') in
      // code paths for node that nothing here runs. A dependency on 'crypto' or 'fs' makes
      // a systemjs or amd host fail to load the bundle.
      write(
        'node_modules/rnd/package.json',
        JSON.stringify({ name: 'rnd', module: 'index.js', main: 'index.js', sideEffects: false })
      );
      write(
        'node_modules/rnd/index.js',
        `export const browser = () => 'browser';
export const nodeCrypto = () => require('crypto').randomBytes(4);
export const nodeFs = async () => (await import('fs')).readFileSync;
import util from 'util';
export const nodeUtil = () => util.inspect;
`
      );
      write('src/index.js', `import { browser } from 'rnd';\nexport default () => browser();\n`);
      await run({ esm: true });

      // nothing is declared as a dependency, for a systemjs host or an es module host
      assert.deepEqual(plain(loadSystem('dist/viz.systemjs.js').deps), []);
      const esmModule = await loadEsm('dist/viz.esm.js');
      assert.deepEqual(plain(esmModule.required), []);
      assert.equal(esmModule.exports(), 'browser');

      // a dynamic import of a builtin stays dynamic in the esm bundle, a require is not there
      const esm = fs.readFileSync(path.join(dir, 'dist/viz.esm.js'), 'utf8');
      assert.doesNotMatch(esm, /^import[^;]*["'](crypto|fs)["']/m);
    });

    it('leaves the runtime modules for node of @qlik/api out of a browser bundle', async () => {
      const lib = 'node_modules/@qlik/api';
      write(
        `${lib}/package.json`,
        JSON.stringify({ name: '@qlik/api', type: 'module', exports: { './auth': './auth.js' } })
      );
      write(
        `${lib}/auth.js`,
        `import { t as getAuthRuntimeModule } from './chunks/public-runtime-modules-AAAA.js';
export default { setDefaultHostConfig: (config) => getAuthRuntimeModule(config) };
`
      );
      write(
        `${lib}/chunks/public-runtime-modules-AAAA.js`,
        `const isNode = typeof process !== 'undefined' && !!process.versions && !!process.versions.node;
async function getAuthRuntimeModule(config) { if (isNode) return import('./auth-BBBB.js'); return config; }
async function getQixRuntimeModule(config) { if (isNode) return import('./qix-CCCC.js'); return config; }
async function getInvokeFetchRuntimeModule(config) { if (isNode) return import('./invoke-fetch-DDDD.js'); return config; }
export { getAuthRuntimeModule as t, getQixRuntimeModule as r, getInvokeFetchRuntimeModule as n };
`
      );
      write(`${lib}/chunks/auth-BBBB.js`, "export const registerAuthModule = () => 'auth-marker';\n");
      write(`${lib}/chunks/qix-CCCC.js`, "export const big = 'qix-marker';\n");
      write(`${lib}/chunks/invoke-fetch-DDDD.js`, "export const big = 'invoke-fetch-marker';\n");
      write('src/index.js', `import auth from '@qlik/api/auth';\nexport default () => auth.setDefaultHostConfig;\n`);

      await run({ browser: true });
      const code = fs.readFileSync(path.join(dir, 'dist/viz.esm.js'), 'utf8');
      assert.match(code, /auth-marker/);
      assert.doesNotMatch(code, /qix-marker|invoke-fetch-marker/);

      // not for a build that is not for a browser
      await run({ browser: false });
      assert.match(fs.readFileSync(path.join(dir, 'dist/viz.esm.js'), 'utf8'), /qix-marker/);
    });

    it('keeps the peer dependencies external', async () => {
      createProject({ pkg: { peerDependencies: { '@nebula.js/stardust': '*', lib: '*' } } });
      process.chdir(dir);
      write('node_modules/lib/package.json', JSON.stringify({ name: 'lib', main: 'index.js' }));
      write('node_modules/lib/index.js', 'module.exports = { big: true };\n');
      write('src/index.js', `import lib from 'lib';\nexport default () => lib.big;\n`);
      await run();
      assert.ok((await loadEsm('dist/viz.esm.js', { skip: true })).required.includes('lib'));
    });

    it('splits a dynamic import into its own chunk only with codeSplit', async () => {
      write('src/lazy.js', 'export default "lazy";\n');
      write('src/index.js', `export default () => import('./lazy.js');\n`);

      await run({ systemjs: false });
      assert.deepEqual(
        fs
          .readdirSync(path.join(dir, 'dist'))
          .filter((f) => !f.endsWith('.map'))
          .sort(),
        ['viz.esm.js']
      );
      assert.equal(
        (await (await import(`${pathToFileURL(path.join(dir, 'dist/viz.esm.js'))}?single`)).default()).default,
        'lazy'
      );

      fs.rmSync(path.join(dir, 'dist'), { recursive: true });
      await run({ systemjs: false, codeSplit: true });
      const files = fs.readdirSync(path.join(dir, 'dist')).filter((f) => !f.endsWith('.map'));
      assert.ok(files.includes('index.js'), files.join(', '));
      assert.ok(files.length >= 2, `expected a chunk next to index.js, got ${files.join(', ')}`);
      assert.equal((await (await import(pathToFileURL(path.join(dir, 'dist/index.js')))).default()).default, 'lazy');
    });

    it('loads the chunks of a code split systemjs bundle from where SystemJS loaded the entry', async () => {
      createProject({ pkg: { module: undefined } });
      process.chdir(dir);
      write('src/lazy.js', 'export default "lazy";\nexport const named = 1;\n');
      write('src/index.js', `export default () => ({ load: () => import('./lazy.js') });\n`);
      await run({ codeSplit: true, systemjs: true });

      const chunks = fs.readdirSync(path.join(dir, 'dist')).filter((f) => /^\d+-.*\.js$/.test(f));
      assert.equal(chunks.length, 1, 'one chunk for the dynamic import');

      const requested = [];
      let sandbox;
      const script = () => {
        const node = { setAttribute: () => {}, getAttribute: () => null };
        Object.defineProperty(node, 'src', {
          set: (url) => {
            requested.push(url);
            // the chunk arrives as the script tag would have run it
            setTimeout(() => {
              vm.runInContext(fs.readFileSync(path.join(dir, 'dist', url.split('/').pop()), 'utf8'), sandbox);
              node.onload({ type: 'load' });
            }, 0);
          },
        });
        return node;
      };
      let registered;
      sandbox = {
        System: {
          register: (deps, factory) => {
            registered = factory;
          },
        },
        // no current script, as is the case when a System.register module executes
        document: {
          currentScript: null,
          getElementsByTagName: () => [],
          createElement: script,
          head: { appendChild: () => {} },
        },
        setTimeout,
        clearTimeout,
        Promise,
        console,
      };
      vm.createContext(sandbox);
      vm.runInContext(fs.readFileSync(path.join(dir, 'dist/index.js'), 'utf8'), sandbox);

      const exported = {};
      const mod = registered(
        (a, b) => {
          if (typeof a === 'string') {
            exported[a] = b;
          } else {
            Object.assign(exported, a);
          }
        },
        {
          meta: { url: 'https://cdn.test/assets/v1/viz.systemjs.js' },
        }
      );
      mod.execute();
      const lazy = await exported.default().load();

      assert.deepEqual(plain(requested), [`https://cdn.test/assets/v1/${chunks[0]}`]);
      assert.equal(lazy.named, 1);
    });

    it('leaves out the unused modules of side effect free packages in development builds too', async () => {
      write(
        'node_modules/lib/package.json',
        JSON.stringify({ name: 'lib', main: 'index.js', module: 'index.js', sideEffects: false })
      );
      write('node_modules/lib/index.js', "export { a } from './a.js';\nexport { b } from './b.js';\n");
      write('node_modules/lib/a.js', 'export const a = () => "a-marker";\n');
      write('node_modules/lib/b.js', 'export const b = () => "b-marker";\n');
      write('src/index.js', `import { a } from 'lib';\nexport default () => a();\n`);
      await run({ mode: 'development' });
      const code = fs.readFileSync(path.join(dir, 'dist/viz.esm.js'), 'utf8');
      assert.match(code, /a-marker/);
      assert.doesNotMatch(code, /b-marker/);
      // and no comments that list the path of every module
      assert.doesNotMatch(code, /\/\*!?\*?\*?\* \.\/src\//);
    });

    it('prefers .native files when building for react native', async () => {
      write(
        'react-native/package.json',
        JSON.stringify({
          name: '@acme/viz-rn',
          module: 'dist/rn.esm.js',
          peerDependencies: { '@nebula.js/stardust': '*' },
        })
      );
      write('src/value.js', 'export default "web";\n');
      write('src/value.native.js', 'export default "native";\n');
      write('src/index.js', `import value from './value';\nexport default () => value;\n`);
      await run({ systemjs: false, reactNative: true, reactNativePath: './react-native' });
      assert.equal((await loadEsm('react-native/dist/rn.esm.js')).exports(), 'native');
    });
  });

  describe('css', () => {
    const cssProject = () => {
      write('src/plain.css', '.plain { color: red; }\n');
      write('src/box.module.css', '.box { color: blue; }\n');
      write(
        'src/index.js',
        `import './plain.css';
import styles from './box.module.css';
export default () => styles;
`
      );
    };

    it('injects the stylesheets in the document when the bundle is loaded', async () => {
      cssProject();
      await run();
      const { doc, css } = documentStub();
      const { exports } = await loadEsm('dist/viz.esm.js', { document: doc });
      assert.equal(css().length, 2);
      assert.ok(css().includes('.plain { color: red; }'));
      assert.match(
        css().find((c) => c.includes('blue')),
        /^\.box_\S+ \{ color: blue; \}$|^\.viz|^\.box/
      );
      // the class names of a css module are what the module exports
      const classes = exports();
      assert.equal(typeof classes.box, 'string');
      assert.ok(css().some((c) => c.includes(`.${classes.box}`)));
    });

    it('can be loaded without a document', async () => {
      cssProject();
      await run();
      const { exports } = await loadEsm('dist/viz.esm.js', { document: undefined });
      assert.equal(typeof exports().box, 'string');
    });

    it('compiles scss with the sass of the project', async () => {
      // the project provides sass, as it would after `npm install sass`
      const sassDir = fs.realpathSync(path.resolve(import.meta.dirname, '../node_modules/sass'));
      fs.mkdirSync(path.join(dir, 'node_modules'), { recursive: true });
      fs.symlinkSync(sassDir, path.join(dir, 'node_modules/sass'), 'dir');
      write('src/style.scss', '$c: green;\n.a { .b { color: $c; } }\n');
      write('src/index.js', `import './style.scss';\nexport default () => 1;\n`);
      await run();
      const { doc, css } = documentStub();
      await loadEsm('dist/viz.esm.js', { document: doc });
      assert.match(css().join(' '), /\.a \.b ?\{ ?color: ?green;? ?\}/);
    });

    it('leaves a url() of the stylesheet as it is written', async () => {
      write('src/a.css', ".a { background: url('/extensions/viz/missing.svg'); }\n");
      write('src/index.js', `import './a.css';\nexport default () => 1;\n`);
      await run();
      const { doc, css } = documentStub();
      await loadEsm('dist/viz.esm.js', { document: doc });
      assert.ok(css().join(' ').includes("url('/extensions/viz/missing.svg')"));
    });

    it('gives the class names of a scss module as the default export', async () => {
      const sassDir = fs.realpathSync(path.resolve(import.meta.dirname, '../node_modules/sass'));
      fs.mkdirSync(path.join(dir, 'node_modules'), { recursive: true });
      fs.symlinkSync(sassDir, path.join(dir, 'node_modules/sass'), 'dir');
      write('src/box.module.scss', '.box { .inner { color: blue; } }\n');
      write('src/index.js', `import styles from './box.module.scss';\nexport default () => styles;\n`);
      await run();
      const { doc, css } = documentStub();
      const { exports } = await loadEsm('dist/viz.esm.js', { document: doc });
      assert.equal(typeof exports().box, 'string');
      assert.ok(css().some((c) => c.includes(`.${exports().box}`)));
    });

    it('compiles less with the less of the project', async () => {
      const lessDir = fs.realpathSync(path.resolve(import.meta.dirname, '../node_modules/less'));
      fs.mkdirSync(path.join(dir, 'node_modules'), { recursive: true });
      fs.symlinkSync(lessDir, path.join(dir, 'node_modules/less'), 'dir');
      write('src/vars.less', '@c: purple;\n');
      write('src/style.less', "@import './vars.less';\n.a { .b { color: @c; } }\n");
      write('src/index.js', `import './style.less';\nexport default () => 1;\n`);
      await run();
      const { doc, css } = documentStub();
      await loadEsm('dist/viz.esm.js', { document: doc });
      assert.match(css().join(' '), /\.a \.b ?\{ ?color: ?purple;? ?\}/);
    });
  });

  describe('errors', () => {
    it('rejects with the compilation error when the source cannot be built', async () => {
      write('src/index.js', 'export default function ( {\n');
      await assert.rejects(run(), /index\.js/);
    });

    it('rejects with a readable message when replacementStrings is not an object', async () => {
      await assert.rejects(run({ replacementStrings: 'nope' }), /replacementStrings should be an object/);
    });
  });
});
