/* eslint-disable import/extensions, no-console */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';

import build from '../lib/build.js';
import { terserLast } from '../lib/minify.js';

// Rolldown keeps a property that is written to a local object, and what it refers to, also when nothing reads it. A
// library that does that (a namespace object that gets helpers) is then bigger than it needs to be, and Terser cannot
// remove it. The compression of Rolldown does, and Terser prints what is left.

const files = {
  'package.json': JSON.stringify({
    name: '@acme/viz',
    version: '1.0.0',
    license: 'MIT',
    author: 'Acme',
    main: 'dist/viz.js',
    module: 'dist/viz.esm.js',
    systemjs: 'dist/viz.systemjs.js',
    peerDependencies: { '@nebula.js/stardust': '*' },
  }),
  'src/index.js': [
    `import { EnterNodeLike } from './lib.js';`,
    `import { dep } from 'dep-lib';`,
    `export const nodes = () => new EnterNodeLike().append('a') + new EnterNodeLike().insert('b');`,
    `export const fromDep = () => dep('x');`,
    `export const guarded = typeof process !== 'undefined';`,
    ``,
  ].join('\n'),
  'node_modules/dep-lib/package.json': '{ "name": "dep-lib", "version": "1.0.0", "main": "index.js" }',
  'node_modules/dep-lib/index.js': `/*! @license DEP_LICENSE_MARK */\nexports.dep = (s) => 'dep:' + s;\n`,
  'src/helper.js': `export function helper() {\n  return 'UNUSED_HELPER_MARK';\n}\n`,
  'src/lib.js': [
    `import { helper } from './helper.js';`,
    `const registry = {};`,
    `registry.helper = helper;`,
    `export function EnterNodeLike() {}`,
    `EnterNodeLike.prototype = {`,
    `  append(s) { return 'append:' + s; },`,
    `  insert(s) { return 'insert:' + s; },`,
    `};`,
    ``,
  ].join('\n'),
};

const OUTPUTS = ['dist/viz.js', 'dist/viz.esm.js', 'dist/viz.systemjs.js'];

describe('production minification', () => {
  let root;
  let dir;
  const originalCwd = process.cwd();
  const originalLog = console.log;
  const originalTime = console.time;
  const originalTimeEnd = console.timeEnd;

  const read = (file) => fs.readFileSync(path.join(dir, file), 'utf8');

  before(async () => {
    root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nebula-minify-')));
    dir = path.join(root, 'project');
    Object.entries(files).forEach(([name, content]) => {
      fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
      fs.writeFileSync(path.join(dir, name), content);
    });
    console.log = () => {};
    console.time = () => {};
    console.timeEnd = () => {};
    process.chdir(dir);
    await build({ cwd: dir });
  });

  after(() => {
    process.chdir(originalCwd);
    console.log = originalLog;
    console.time = originalTime;
    console.timeEnd = originalTimeEnd;
    fs.rmSync(root, { recursive: true, force: true });
  });

  OUTPUTS.forEach((file) => {
    it(`${file}: removes the property that is written to a local object and nothing reads, keeps the prototype`, () => {
      const code = read(file);
      assert.ok(!code.includes('UNUSED_HELPER_MARK'), 'the unused helper is removed');
      assert.ok(code.includes('append:') && code.includes('insert:'), 'the methods of the prototype are kept');
    });

    it(`${file}: has plain strings, so that the guard of typeof process is recognised`, () => {
      const code = read(file);
      assert.ok(!code.includes('`'), 'no template literals');
      assert.match(code, /typeof process<"u"|"u">typeof process|typeof process!=+"undefined"/);
    });

    it(`${file}: has the banner once, first, and the legal comment of the code that is kept`, () => {
      const code = read(file);
      assert.ok(code.startsWith('/*\n* @acme/viz v1.0.0'));
      assert.equal(code.split('Released under the MIT license').length - 1, 1);
      assert.equal(code.split('DEP_LICENSE_MARK').length - 1, 1);
    });

    it(`${file}: has a map that decodes and leads to the sources, and ignores what is in node_modules`, () => {
      const code = read(file);
      const map = JSON.parse(read(`${file}.map`));
      assert.equal(map.file, path.basename(file));
      assert.ok(map.sources.includes('../src/lib.js'), map.sources.join(', '));
      // Rollup, which converts to SystemJS, still writes the name that it had before `ignoreList`
      const ignoreList = map.ignoreList || map.x_google_ignoreList;
      assert.ok(ignoreList.length > 0, 'something is ignored');
      ignoreList.forEach((i) => assert.match(map.sources[i], /node_modules/));
      assert.ok(map.sources.some((source, i) => !/node_modules/.test(source) && !ignoreList.includes(i)));
      // the position of a token in the minified code is the position of its source, through the compression, Terser
      // and, for SystemJS, the conversion
      const lines = code.split('\n');
      const line = lines.findIndex((l) => l.includes('append:'));
      const column = lines[line].indexOf('append:');
      const original = originalPositionFor(new TraceMap(map), { line: line + 1, column });
      assert.match(original.source, /src\/lib\.js$/);
      assert.equal(original.line, 6, `${original.line}`);
    });
  });

  it('still works: the prototype that is kept has its methods', () => {
    const module = { exports: {} };
    vm.runInNewContext(read('dist/viz.js'), { module, exports: module.exports, process: {} });
    assert.equal(module.exports.nodes(), 'append:ainsert:b');
    assert.equal(module.exports.fromDep(), 'dep:x');
  });

  it('prints a chunk that has no map without one', async () => {
    const bundle = { 'a.js': { type: 'chunk', fileName: 'a.js', code: 'var  a = 1;\nconsole.log(a);', map: null } };
    await terserLast({ banner: '' }).generateBundle.call({}, { sourcemap: true, format: 'es' }, bundle);
    assert.equal(bundle['a.js'].map, null);
    assert.ok(!bundle['a.js'].code.includes('  '), 'printed');
  });

  it('leaves the development build readable, with the unused helper as the tree shaker leaves it', async () => {
    await build({ cwd: dir, mode: 'development' });
    const code = read('dist/viz.js');
    assert.ok(code.split('\n').length > 20);
    assert.match(code, /^\/\*\n\* @acme\/viz/);
  });
});
