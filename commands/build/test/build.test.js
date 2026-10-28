/* eslint-disable import/extensions, no-console, no-return-assign, no-underscore-dangle, no-template-curly-in-string */
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
      main: 'dist/viz.js',
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

const loadUmd = (file, { document, requires = {} } = {}) => {
  const module = { exports: {} };
  const required = [];
  const sandbox = {
    module,
    exports: module.exports,
    document,
    Object,
    Symbol,
    Promise,
    require: (id) => {
      required.push(id);
      if (id === '@nebula.js/stardust') {
        return stardust;
      }
      if (id in requires) {
        return requires[id];
      }
      throw new Error(`unexpected require("${id}")`);
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(dir, file), 'utf8'), sandbox, { filename: file });
  return { exports: module.exports, required };
};

const loadSystem = (file) => {
  let registered;
  const exported = {};
  const sandbox = { System: { register: (deps, factory) => (registered = { deps, factory }) } };
  vm.runInNewContext(fs.readFileSync(path.join(dir, file), 'utf8'), sandbox, { filename: file });
  const mod = registered.factory(
    (a, b) => (typeof a === 'string' ? (exported[a] = b) : Object.assign(exported, a)),
    {}
  );
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
    it('writes a umd, an esm and a systemjs bundle with source maps and a banner', async () => {
      await run();

      ['dist/viz.js', 'dist/viz.esm.js', 'dist/viz.systemjs.js'].forEach((file) => {
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

    it('keeps the legal comments of the source and its dependencies when minifying, below the banner', async () => {
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
      const code = fs.readFileSync(path.join(dir, 'dist/viz.js'), 'utf8');
      assert.ok(code.startsWith('/*\n* @acme/viz v2.3.4'), 'the banner is first');
      ['Copyright Acme, kept', '@license MIT dep'].forEach((notice) => {
        assert.equal(code.split(notice).length - 1, 1, `${notice} appears once`);
      });
      assert.ok(code.indexOf('@acme/viz') < code.indexOf('@license MIT dep'));
      assert.equal(loadUmd('dist/viz.js').exports(), 42);

      // and once only, without the minifier involved
      await run({ mode: 'development' });
      assert.equal(fs.readFileSync(path.join(dir, 'dist/viz.js'), 'utf8').split('@license MIT dep').length - 1, 1);
    });

    it('lists the sources relative to the output in the source map', async () => {
      await run();
      const map = JSON.parse(fs.readFileSync(path.join(dir, 'dist/viz.js.map'), 'utf8'));
      assert.ok(map.sources.includes('../src/index.js'), map.sources.join(', '));
    });

    it('skips the source maps with sourcemap: false', async () => {
      await run({ sourcemap: false });
      assert.equal(fs.existsSync(path.join(dir, 'dist/viz.js.map')), false);
      assert.doesNotMatch(fs.readFileSync(path.join(dir, 'dist/viz.js'), 'utf8'), /sourceMappingURL/);
    });

    it('skips the systemjs bundle with systemjs: false and the esm bundle when package.json has no module', async () => {
      createProject({ pkg: { module: undefined } });
      process.chdir(dir);
      await run({ systemjs: false });
      assert.ok(fs.existsSync(path.join(dir, 'dist/viz.js')));
      assert.equal(fs.existsSync(path.join(dir, 'dist/viz.systemjs.js')), false);
      assert.equal(fs.existsSync(path.join(dir, 'dist/viz.esm.js')), false);
    });

    it('minifies in production and leaves the code readable in development', async () => {
      await run();
      const minified = fs.readFileSync(path.join(dir, 'dist/viz.js'), 'utf8').split('\n').length;
      await run({ mode: 'development' });
      const readable = fs.readFileSync(path.join(dir, 'dist/viz.js'), 'utf8').split('\n').length;
      assert.ok(readable > minified * 3, `${readable} lines in development, ${minified} in production`);
    });

    it('builds the esm bundle into the core package', async () => {
      write('core/package.json', JSON.stringify({ name: '@acme/core', module: 'esm/core.js' }));
      await run({ core: 'core' });
      assert.ok(fs.existsSync(path.join(dir, 'core/esm/core.js')));
    });
  });

  describe('umd', () => {
    it('is the supernova function itself when there is only a default export', async () => {
      await run();
      const { exports, required } = loadUmd('dist/viz.js');
      assert.equal(typeof exports, 'function');
      assert.equal(exports.__esModule, undefined);
      assert.deepEqual(plain(required), ['@nebula.js/stardust']);
      assert.equal(typeof exports().component, 'function');
    });

    it('is also reachable through the global and the amd define', async () => {
      await run();
      const code = fs.readFileSync(path.join(dir, 'dist/viz.js'), 'utf8');

      const globalScope = { stardust };
      globalScope.self = globalScope;
      vm.runInNewContext(code, globalScope);
      assert.equal(typeof globalScope.viz, 'function');

      let amd;
      const define = Object.assign((deps, factory) => (amd = { deps, result: factory(stardust) }), { amd: true });
      vm.runInNewContext(code, { define });
      assert.deepEqual(plain(amd.deps), ['@nebula.js/stardust']);
      assert.equal(typeof amd.result, 'function');
    });

    it('exposes named exports on an object, marked so that a default import finds the default export', async () => {
      write('src/index.js', 'export const named = 1;\nexport default function supernova() { return {}; }\n');
      await run();
      const { exports } = loadUmd('dist/viz.js');
      assert.equal(exports.named, 1);
      assert.equal(typeof exports.default, 'function');
      assert.equal(exports.__esModule, true);
      assert.equal(Object.keys(exports).includes('__esModule'), false);
    });

    it('exposes named exports on a plain object when there is no default export', async () => {
      write('src/index.js', 'export const a = 1;\nexport const b = 2;\n');
      await run();
      const { exports } = loadUmd('dist/viz.js');
      assert.deepEqual(plain(exports), { a: 1, b: 2 });
      assert.equal(exports.__esModule, undefined);
    });

    it('works with a commonjs entry', async () => {
      write('src/index.js', 'module.exports = function supernova() { return { cjs: true }; };\n');
      await run();
      assert.deepEqual(plain(loadUmd('dist/viz.js').exports()), { cjs: true });
    });
  });

  describe('esm and systemjs', () => {
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
      assert.deepEqual(plain(loadUmd('dist/viz.js').exports()), { env: 'production', version: '2.3.4', flag: 'on' });
      await run({ mode: 'development', replacementStrings: { __VERSION__: '"x"', 'process.env.FLAG': '"y"' } });
      assert.equal(loadUmd('dist/viz.js').exports().env, 'development');
    });

    it('reads json files', async () => {
      write('src/data.json', '{ "answer": 42 }');
      write('src/index.js', `import data from './data.json';\nexport default () => data.answer;\n`);
      await run();
      assert.equal(loadUmd('dist/viz.js').exports(), 42);
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
      const out = plain(loadUmd('dist/viz.js').exports());
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
      assert.deepEqual(plain(loadUmd('dist/viz.js').exports()), { n: 2, kind: 'a' });
    });

    it('keeps an import that cannot be resolved out of the bundle as an external', async () => {
      write('src/index.js', `import qlik from 'qlik';\nexport default () => typeof qlik;\n`);
      await run();
      const { exports, required } = loadUmd('dist/viz.js', { requires: { qlik: {} } });
      assert.ok(required.includes('qlik'));
      assert.equal(exports(), 'object');
      // stardust is not imported by this entry, so only the module that cannot be resolved is a dependency
      assert.deepEqual(plain(loadSystem('dist/viz.systemjs.js').deps), ['qlik']);
    });

    it('keeps node builtins external, unless preferBuiltins is off and a package of that name exists', async () => {
      write('src/index.js', `import { join } from 'path';\nexport default () => join('a', 'b');\n`);
      await run();
      assert.ok(loadUmd('dist/viz.js', { requires: { path } }).required.includes('path'));

      write('node_modules/path/package.json', JSON.stringify({ name: 'path', main: 'index.js' }));
      write('node_modules/path/index.js', 'exports.join = (a, b) => `${a}+${b}`;\n');
      await run({ preferBuiltins: false });
      const { exports, required } = loadUmd('dist/viz.js');
      assert.equal(required.includes('path'), false);
      assert.equal(exports(), 'a+b');
    });

    it('keeps the peer dependencies external', async () => {
      createProject({ pkg: { peerDependencies: { '@nebula.js/stardust': '*', lib: '*' } } });
      process.chdir(dir);
      write('node_modules/lib/package.json', JSON.stringify({ name: 'lib', main: 'index.js' }));
      write('node_modules/lib/index.js', 'module.exports = { big: true };\n');
      write('src/index.js', `import lib from 'lib';\nexport default () => lib.big;\n`);
      await run();
      assert.ok(loadUmd('dist/viz.js', { requires: { lib: { big: 'external' } } }).required.includes('lib'));
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
        ['viz.esm.js', 'viz.js']
      );
      assert.equal(
        (await (await import(`${pathToFileURL(path.join(dir, 'dist/viz.esm.js'))}?single`)).default()).default,
        'lazy'
      );

      fs.rmSync(path.join(dir, 'dist'), { recursive: true });
      await run({ systemjs: false, codeSplit: true });
      const files = fs.readdirSync(path.join(dir, 'dist')).filter((f) => !f.endsWith('.map'));
      assert.ok(files.includes('index.js'), files.join(', '));
      assert.ok(files.length >= 3, `expected a chunk next to index.js and viz.js, got ${files.join(', ')}`);
      assert.equal((await (await import(pathToFileURL(path.join(dir, 'dist/index.js')))).default()).default, 'lazy');
    });

    it('prefers .native files when building for react native', async () => {
      write(
        'react-native/package.json',
        JSON.stringify({ name: '@acme/viz-rn', main: 'dist/rn.js', peerDependencies: { '@nebula.js/stardust': '*' } })
      );
      write('src/value.js', 'export default "web";\n');
      write('src/value.native.js', 'export default "native";\n');
      write('src/index.js', `import value from './value';\nexport default () => value;\n`);
      await run({ systemjs: false, reactNative: true, reactNativePath: './react-native' });
      assert.equal(loadUmd('react-native/dist/rn.js').exports(), 'native');
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
      const { exports } = loadUmd('dist/viz.js', { document: doc });
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
      const { exports } = loadUmd('dist/viz.js', { document: undefined });
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
      loadUmd('dist/viz.js', { document: doc });
      assert.match(css().join(' '), /\.a \.b ?\{ ?color: ?green;? ?\}/);
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
