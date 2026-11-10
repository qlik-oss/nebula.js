import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';

import buildBundle from '@nebula.js/cli-build';
import build from '../lib/build.js';

// objects created in a vm sandbox have the prototypes of another realm, compare them as plain data
const plain = (value) => JSON.parse(JSON.stringify(value));

const originalCwd = process.cwd();
const originalWarn = console.warn;

let root;
let dir;
let warnings;
let counter = 0;

const write = (name, content) => {
  const file = path.join(dir, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

const read = (name) => fs.readFileSync(path.join(dir, name), 'utf8');

// loads an amd module the way requirejs does: resolve the dependencies, call the factory with them
const loadAmd = (name, modules = {}) => {
  let defined;
  const define = Object.assign(
    (deps, factory) => {
      if (typeof deps === 'function') {
        defined = { deps: [], value: deps() };
      } else {
        defined = { deps, value: factory(...deps.map((d) => modules[d] ?? {})) };
      }
    },
    { amd: true }
  );
  vm.runInNewContext(read(name), { define }, { filename: name });
  return defined;
};

describe('nebula sense', () => {
  before(() => {
    root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nebula-sense-')));
    console.warn = (message) => warnings.push(message);
  });

  after(() => {
    console.warn = originalWarn;
    process.chdir(originalCwd);
    fs.rmSync(root, { recursive: true, force: true });
  });

  beforeEach(() => {
    counter += 1;
    warnings = [];
    dir = path.join(root, `project-${counter}`);
    // a project that `nebula build` has already built
    write(
      'package.json',
      JSON.stringify({
        name: '@acme/viz',
        version: '3.1.0',
        description: 'A visualization',
        author: 'Acme',
        module: 'dist/viz.esm.js',
        files: ['viz-ext', 'viz.qext'],
        peerDependencies: { '@nebula.js/stardust': '*' },
        qext: { name: 'Acme viz', icon: 'bar', preview: 'preview.png' },
      })
    );
    write('dist/viz.esm.js', 'export default function supernova() {\n  return { component() {} };\n}\n');
    write('preview.png', 'png');
    process.chdir(dir);
  });

  const run = (options = {}) => build({ output: '<name>-ext', minify: true, sourcemap: false, ...options });

  describe('extension files', () => {
    it('writes the qext and the extension module to the output directory', async () => {
      await run();

      const qext = JSON.parse(read('viz-ext/viz.qext'));
      assert.deepEqual(qext, {
        name: 'Acme viz',
        version: '3.1.0',
        description: 'A visualization',
        author: 'Acme',
        icon: 'bar',
        preview: 'preview.png',
        type: 'visualization',
        supernova: true,
      });
      assert.ok(fs.existsSync(path.join(dir, 'viz-ext/viz.js')));
      assert.equal(read('viz-ext/preview.png'), 'png');
      // one module, the extension is not in a file of its own and no copy of the es module is written
      assert.deepEqual(fs.readdirSync(path.join(dir, 'viz-ext')).sort(), ['preview.png', 'viz.js', 'viz.qext']);
    });

    it('is the supernova as an amd module, when there is no extension definition', async () => {
      await run();
      const { deps, value } = loadAmd('viz-ext/viz.js');
      assert.deepEqual(plain(deps), []);
      assert.equal(typeof value, 'function');
      assert.equal(typeof value({}).component, 'function');
    });

    it('adds the extension definition to the supernova', async () => {
      write('src/ext.js', 'export default { support: { export: true } };\n');
      await run({ ext: 'src/ext.js' });
      assert.deepEqual(plain(loadAmd('viz-ext/viz.js').value({}).ext), { support: { export: true } });
    });

    it('gives the environment to an extension definition that is a function', async () => {
      write('src/ext.js', 'export default (env) => ({ built: !!env });\n');
      await run({ ext: 'src/ext.js' });
      assert.deepEqual(plain(loadAmd('viz-ext/viz.js').value({}).ext), { built: true });
    });

    it('takes the definition of a default export, also with named exports next to it', async () => {
      write('src/ext.js', 'export const named = 1;\nexport default { support: { snapshot: true } };\n');
      await run({ ext: 'src/ext.js' });
      assert.deepEqual(plain(loadAmd('viz-ext/viz.js').value({}).ext), { support: { snapshot: true } });
    });

    it('writes to the output directory that was asked for', async () => {
      await run({ output: 'custom' });
      assert.ok(fs.existsSync(path.join(dir, 'custom/viz.qext')));
      assert.ok(fs.existsSync(path.join(dir, 'custom/viz.js')));
    });

    it('merges the meta file into the qext', async () => {
      write('meta.json', JSON.stringify({ name: 'From meta', icon: 'table' }));
      await run({ meta: 'meta.json' });
      const qext = JSON.parse(read('viz-ext/viz.qext'));
      assert.equal(qext.name, 'From meta');
      assert.equal(qext.icon, 'table');
    });

    it('warns about files that are missing from package.json files', async () => {
      write(
        'package.json',
        JSON.stringify({ name: '@acme/viz', version: '1', module: 'dist/viz.esm.js', files: ['dist'] })
      );
      await run();
      assert.match(warnings.join('\n'), /viz\.qext.*should be included in package\.json 'files'/);
    });

    it('finds the module after a code split build of a package with module and systemjs', async () => {
      write(
        'package.json',
        JSON.stringify({
          name: '@acme/viz',
          version: '1',
          module: 'dist/viz.esm.js',
          systemjs: 'dist/viz.systemjs.js',
          files: ['viz-ext', 'viz.qext'],
          peerDependencies: { '@nebula.js/stardust': '*' },
        })
      );
      write('src/lazy.js', 'export default "lazy";\n');
      write('src/index.js', "export default () => import('./lazy.js');\n");
      fs.rmSync(path.join(dir, 'dist'), { recursive: true });
      await buildBundle({ cwd: dir, codeSplit: true, sourcemap: false });

      await run();
      assert.ok(fs.existsSync(path.join(dir, 'viz-ext/viz.js')));
    });

    it('rejects when package.json has no module', async () => {
      write('package.json', JSON.stringify({ name: '@acme/viz', version: '1' }));
      await assert.rejects(run(), /no "module" field/);
    });

    it('rejects when the module is not built', async () => {
      write('package.json', JSON.stringify({ name: '@acme/viz', version: '1', module: 'dist/none.js' }));
      await assert.rejects(run(), /run nebula build first/);
    });
  });

  describe('module', () => {
    it('leaves the peer dependencies and the modules that Qlik Sense provides out of it as amd dependencies', async () => {
      write(
        'package.json',
        JSON.stringify({ name: '@acme/viz', version: '1', module: 'dist/viz.esm.js', peerDependencies: { react: '*' } })
      );
      write('node_modules/react/package.json', JSON.stringify({ name: 'react', main: 'index.js' }));
      write('node_modules/react/index.js', 'module.exports = { big: true };\n');
      write(
        'dist/viz.esm.js',
        "import { useElement } from '@nebula.js/stardust';\nimport react from 'react';\nimport qlik from 'qlik';\nexport default () => ({ useElement, react, qlik });\n"
      );
      await run();
      const { deps, value } = loadAmd('viz-ext/viz.js', {
        '@nebula.js/stardust': { useElement: 1 },
        react: { react: true },
        qlik: { app: true },
      });
      assert.deepEqual(plain(deps).sort(), ['@nebula.js/stardust', 'qlik', 'react']);
      assert.deepEqual(plain(value()), { useElement: 1, react: { react: true }, qlik: { app: true } });
      assert.match(warnings.join('\n'), /qlik/);
    });

    it('bundles the modules it can resolve', async () => {
      write('node_modules/helper/package.json', JSON.stringify({ name: 'helper', main: 'index.js' }));
      write('node_modules/helper/index.js', 'module.exports = { double: (n) => n * 2 };\n');
      write('dist/viz.esm.js', "import { double } from 'helper';\nexport default () => double(21);\n");
      await run();
      const { deps, value } = loadAmd('viz-ext/viz.js');
      assert.deepEqual(plain(deps), []);
      assert.equal(value(), 42);
    });

    it('replaces process.env.NODE_ENV so the module can be loaded in a browser', async () => {
      write('dist/viz.esm.js', 'export default () => process.env.NODE_ENV;\n');
      await run();
      assert.equal(loadAmd('viz-ext/viz.js').value(), 'production');
    });

    it('makes an empty module of a node builtin', async () => {
      write('dist/viz.esm.js', "import { join } from 'path';\nexport default () => typeof join;\n");
      await run();
      const { deps, value } = loadAmd('viz-ext/viz.js');
      assert.deepEqual(plain(deps), []);
      assert.equal(value(), 'undefined');
    });
  });

  describe('extension definition', () => {
    it('leaves the syntax that the browsers of Qlik support as it is', async () => {
      write(
        'src/ext.js',
        'const o = {};\nexport default { a: o?.x ?? "fallback", b: class { #p = 1; get p() { return this.#p; } } };\n'
      );
      await run({ ext: 'src/ext.js', minify: false });
      assert.match(read('viz-ext/viz.js'), /\?\?/);
      assert.equal(loadAmd('viz-ext/viz.js').value({}).ext.a, 'fallback');
    });

    it('does not transpile node_modules, they are bundled as they are', async () => {
      write('node_modules/modern/package.json', JSON.stringify({ name: 'modern', main: 'index.js' }));
      write('node_modules/modern/index.js', 'module.exports = { v: (null ?? "kept") };\n');
      write('src/ext.js', "import modern from 'modern';\nexport default modern;\n");
      await run({ ext: 'src/ext.js', minify: false });
      assert.match(read('viz-ext/viz.js'), /\?\?/);
    });

    it('rejects when the definition cannot be built', async () => {
      write('src/ext.js', 'export default {\n');
      await assert.rejects(run({ ext: 'src/ext.js' }), /ext\.js/);
    });
  });

  describe('output', () => {
    it('minifies with minify and leaves the code readable without it', async () => {
      write('dist/viz.esm.js', 'const definition = { type: "items" };\nexport default () => definition;\n');
      await run({ minify: true });
      const minified = read('viz-ext/viz.js').length;
      await run({ minify: false });
      const readable = read('viz-ext/viz.js');
      assert.ok(readable.length > minified);
      assert.match(readable, /\n/);
    });

    it('extracts the notices of the licenses when minifying', async () => {
      write('dist/viz.esm.js', '/*! @license MIT Acme */\nexport default () => ({ a: 1 });\n');
      await run({ minify: true });
      assert.match(read('viz-ext/viz.js.LICENSE.txt'), /@license MIT Acme/);
    });

    it('extracts a notice that follows a string containing the start of a comment', async () => {
      write('dist/viz.esm.js', 'const path = "/data/*";\n/*! @license MIT Acme */\nexport default () => path;\n');
      await run({ minify: true });
      assert.match(read('viz-ext/viz.js.LICENSE.txt'), /@license MIT Acme/);
    });

    it('writes a source map only with sourcemap', async () => {
      await run({ sourcemap: true });
      assert.ok(fs.existsSync(path.join(dir, 'viz-ext/viz.js.map')));
      assert.match(read('viz-ext/viz.js'), /sourceMappingURL=viz\.js\.map/);
      fs.rmSync(path.join(dir, 'viz-ext'), { recursive: true });
      await run({ sourcemap: false });
      assert.equal(fs.existsSync(path.join(dir, 'viz-ext/viz.js.map')), false);
    });
  });
});
