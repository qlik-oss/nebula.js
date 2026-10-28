/* eslint-disable import/extensions, no-console, no-underscore-dangle */
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';

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
        main: 'dist/viz.js',
        files: ['viz-ext', 'viz.js', 'viz.qext'],
        qext: { name: 'Acme viz', icon: 'bar', preview: 'preview.png' },
      })
    );
    write('dist/viz.js', 'define(function () { return function supernova() { return {}; }; });\n');
    write('dist/viz.js.map', '{}');
    write('preview.png', 'png');
    process.chdir(dir);
  });

  const run = (options = {}) => build({ output: '<name>-ext', minify: true, sourcemap: false, ...options });

  describe('extension files', () => {
    it('writes the qext, the loader and a copy of the visualization to the output directory', async () => {
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
      assert.equal(read('viz-ext/dist/viz.js'), read('dist/viz.js'));
      assert.equal(read('viz-ext/preview.png'), 'png');
    });

    it('loads the visualization as it is when there is no extension definition', async () => {
      await run();
      assert.match(read('viz-ext/viz.js'), /define\(\['\.\/dist\/viz'\], \(supernova\) => supernova\)/);
      assert.equal(fs.existsSync(path.join(dir, 'viz-ext/ext.js')), false);
    });

    it('adds the extension definition to the supernova when there is one', async () => {
      write('src/ext.js', 'export default { support: { export: true } };\n');
      await run({ ext: 'src/ext.js' });
      const loader = read('viz-ext/viz.js');
      assert.match(loader, /define\(\['\.\/dist\/viz', '\.\/ext'\]/);
      assert.ok(fs.existsSync(path.join(dir, 'viz-ext/ext.js')));
    });

    it('writes to the output directory that was asked for', async () => {
      await run({ output: 'custom' });
      assert.ok(fs.existsSync(path.join(dir, 'custom/viz.qext')));
    });

    it('merges the meta file into the qext', async () => {
      write('meta.json', JSON.stringify({ name: 'From meta', icon: 'table' }));
      await run({ meta: 'meta.json' });
      const qext = JSON.parse(read('viz-ext/viz.qext'));
      assert.equal(qext.name, 'From meta');
      assert.equal(qext.icon, 'table');
    });

    it('warns about files that are missing from package.json files', async () => {
      write('package.json', JSON.stringify({ name: '@acme/viz', version: '1', main: 'dist/viz.js', files: ['dist'] }));
      await run();
      assert.match(warnings.join('\n'), /viz\.js.*should be included in package\.json 'files'/);
    });

    it('copies the source map of the visualization with sourcemap', async () => {
      await run({ sourcemap: true });
      assert.ok(fs.existsSync(path.join(dir, 'viz-ext/dist/viz.js.map')));
    });
  });

  describe('extension definition bundle', () => {
    it('returns the definition when it is the only export', async () => {
      write('src/ext.js', 'export default { definition: { type: "items" }, support: { export: true } };\n');
      await run({ ext: 'src/ext.js' });
      const { deps, value } = loadAmd('viz-ext/ext.js');
      assert.deepEqual(plain(deps), []);
      assert.deepEqual(plain(value), { definition: { type: 'items' }, support: { export: true } });
    });

    it('returns an object with the named exports when there is no default export', async () => {
      write('src/ext.js', 'export const definition = { type: "items" };\nexport const support = { snapshot: true };\n');
      await run({ ext: 'src/ext.js' });
      const { value } = loadAmd('viz-ext/ext.js');
      assert.deepEqual(plain(value), { definition: { type: 'items' }, support: { snapshot: true } });
    });

    it('marks the object so that the default export can be found when there are named exports next to it', async () => {
      write('src/ext.js', 'export const named = 1;\nexport default { definition: {} };\n');
      await run({ ext: 'src/ext.js' });
      const { value } = loadAmd('viz-ext/ext.js');
      assert.equal(value.__esModule, true);
      assert.deepEqual(plain(value.default), { definition: {} });
      assert.equal(value.named, 1);
    });

    it('returns a function definition as it is, for the loader to call with the environment', async () => {
      write('src/ext.js', 'export default function ext(env) { return { env: !!env }; }\n');
      await run({ ext: 'src/ext.js' });
      const { value } = loadAmd('viz-ext/ext.js');
      assert.equal(typeof value, 'function');
      assert.deepEqual(plain(value({})), { env: true });
    });

    it('leaves modules that Qlik Sense provides out of the bundle as amd dependencies', async () => {
      write('src/ext.js', "import qlik from 'qlik';\nimport $ from 'jquery';\nexport default () => ({ qlik, $ });\n");
      await run({ ext: 'src/ext.js' });
      const { deps, value } = loadAmd('viz-ext/ext.js', { qlik: { app: true }, jquery: { fn: true } });
      assert.deepEqual(plain(deps).sort(), ['jquery', 'qlik']);
      assert.deepEqual(plain(value()), { qlik: { app: true }, $: { fn: true } });
      assert.match(warnings.join('\n'), /qlik/);
    });

    it('bundles the modules it can resolve', async () => {
      write('node_modules/helper/package.json', JSON.stringify({ name: 'helper', main: 'index.js' }));
      write('node_modules/helper/index.js', 'module.exports = { double: (n) => n * 2 };\n');
      write('src/ext.js', "import { double } from 'helper';\nexport default { n: double(21) };\n");
      await run({ ext: 'src/ext.js' });
      const { deps, value } = loadAmd('viz-ext/ext.js');
      assert.deepEqual(plain(deps), []);
      assert.deepEqual(plain(value), { n: 42 });
    });

    it('transpiles the code for the browsers that Qlik Sense supports', async () => {
      write(
        'src/ext.js',
        'const o = {};\nexport default { a: o?.x ?? "fallback", b: class { #p = 1; get p() { return this.#p; } } };\n'
      );
      await run({ ext: 'src/ext.js', minify: false });
      const code = read('viz-ext/ext.js');
      assert.doesNotMatch(code, /\?\?|\?\./);
      assert.equal(loadAmd('viz-ext/ext.js').value.a, 'fallback');
    });

    it('does not transpile node_modules, they are bundled as they are', async () => {
      write('node_modules/modern/package.json', JSON.stringify({ name: 'modern', main: 'index.js' }));
      write('node_modules/modern/index.js', 'module.exports = { v: (null ?? "kept") };\n');
      write('src/ext.js', "import modern from 'modern';\nexport default modern;\n");
      await run({ ext: 'src/ext.js', minify: false });
      assert.match(read('viz-ext/ext.js'), /\?\?/);
    });

    it('replaces process.env.NODE_ENV so the module can be loaded in a browser', async () => {
      write('src/ext.js', 'export default { env: process.env.NODE_ENV };\n');
      await run({ ext: 'src/ext.js' });
      assert.deepEqual(plain(loadAmd('viz-ext/ext.js').value), { env: 'production' });
    });

    it('minifies with minify and leaves the code readable without it', async () => {
      write('src/ext.js', 'const definition = { type: "items" };\nexport default definition;\n');
      await run({ ext: 'src/ext.js', minify: true });
      const minified = read('viz-ext/ext.js').length;
      await run({ ext: 'src/ext.js', minify: false });
      const readable = read('viz-ext/ext.js');
      assert.ok(readable.length > minified);
      assert.match(readable, /\n/);
    });

    it('keeps license comments when minifying', async () => {
      write('src/ext.js', '/*! @license MIT Acme */\nexport default { a: 1 };\n');
      await run({ ext: 'src/ext.js', minify: true });
      assert.match(read('viz-ext/ext.js'), /@license MIT Acme/);
    });

    it('writes a source map only with sourcemap', async () => {
      write('src/ext.js', 'export default { a: 1 };\n');
      await run({ ext: 'src/ext.js', sourcemap: true });
      assert.ok(fs.existsSync(path.join(dir, 'viz-ext/ext.js.map')));
      assert.match(read('viz-ext/ext.js'), /sourceMappingURL=ext\.js\.map/);
      fs.rmSync(path.join(dir, 'viz-ext'), { recursive: true });
      await run({ ext: 'src/ext.js', sourcemap: false });
      assert.equal(fs.existsSync(path.join(dir, 'viz-ext/ext.js.map')), false);
    });

    it('rejects when the definition cannot be built', async () => {
      write('src/ext.js', 'export default {\n');
      await assert.rejects(run({ ext: 'src/ext.js' }), /ext\.js/);
    });
  });
});
