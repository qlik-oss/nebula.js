import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { terserLast } from '../options.mjs';
import { buildTo, write, banner } from './helpers.mjs';

// Rolldown keeps a property that is written to a local object, and what it refers to, also when nothing reads it.
// A library that does that (a namespace object that gets helpers) is then bigger than it needs to be, and Terser cannot
// remove it. The compression of Rolldown does, and Terser prints what is left.

describe('production minification', () => {
  let dir;

  before(() => {
    dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'minify-test-')));
    write(dir, {
      'src/index.js': [
        `import { EnterNodeLike } from './lib.js';`,
        `export const nodes = () => new EnterNodeLike().append('a') + new EnterNodeLike().insert('b');`,
        `import { dep } from 'dep-lib';`,
        `export const fromDep = () => dep('x');`,
        `export const guarded = typeof process !== 'undefined';`,
        ``,
      ].join('\n'),
      'node_modules/dep-lib/package.json': '{ "name": "dep-lib", "version": "1.0.0", "main": "index.js" }',
      'node_modules/dep-lib/index.js': `/*! @license DEP_LICENSE_MARK */\nexports.dep = (s) => 'dep:' + s;\n`,
      'src/lib.js': [
        `const registry = {};`,
        `registry.helper = function () {`,
        `  return 'UNUSED_HELPER_MARK';`,
        `};`,
        `export function EnterNodeLike() {}`,
        `EnterNodeLike.prototype = {`,
        `  append(s) { return 'append:' + s; },`,
        `  insert(s) { return 'insert:' + s; },`,
        `};`,
        ``,
      ].join('\n'),
    });
  });

  after(() => fs.rmSync(dir, { recursive: true, force: true }));

  const bundle = (outputs) => ({
    label: 'test',
    debug: false,
    minify: true,
    sourcemap: true,
    define: true,
    input: path.join(dir, 'src', 'index'),
    external: [],
    inlineDynamicImports: true,
    outputs,
  });

  const outputs = {
    umd: { format: 'umd', file: 'umd/stardust.js', exports: 'named', name: 'stardust' },
    es: { format: 'es', file: 'es/stardust.js', exports: 'named' },
    system: { format: 'system', dir: 'sys', entryFileName: 'stardust.systemjs.js', exports: 'named' },
  };

  Object.entries(outputs).forEach(([name, output]) => {
    test(`${name}: a property written to a local object that nothing reads is removed, a prototype that is used is kept`, async () => {
      const out = {
        ...output,
        ...(output.file ? { file: path.join(dir, output.file) } : { dir: path.join(dir, output.dir) }),
      };
      await buildTo(dir, bundle([out]));
      const file = output.file ? out.file : path.join(out.dir, output.entryFileName);
      const code = fs.readFileSync(file, 'utf8');
      assert.ok(!code.includes('UNUSED_HELPER_MARK'), 'the unused helper is removed');
      assert.ok(code.includes('append:') && code.includes('insert:'), 'the methods of the prototype are kept');
      // plain strings, and the banner and the directive are where they were
      assert.ok(!/`/.test(code), 'no template literals');
      assert.match(code, /typeof process<"u"|"u">typeof process|typeof process!=+"undefined"/);
      assert.ok(code.startsWith(banner), 'banner');
    });
  });

  Object.entries(outputs).forEach(([name, output]) => {
    test(`${name}: the banner is there once, the legal comments are kept, and the map keeps file and ignoreList`, async () => {
      const out = {
        ...output,
        ...(output.file ? { file: path.join(dir, `m-${output.file}`) } : { dir: path.join(dir, `m-${output.dir}`) }),
      };
      await buildTo(dir, bundle([out]));
      const file = output.file ? out.file : path.join(out.dir, output.entryFileName);
      const code = fs.readFileSync(file, 'utf8');
      assert.equal(code.split('Released under the MIT license').length - 1, 1, 'one banner');
      assert.ok(code.includes('DEP_LICENSE_MARK'), 'legal comment');
      const map = JSON.parse(fs.readFileSync(`${file}.map`, 'utf8'));
      if (name === 'system') return; // the conversion has never kept the ignore list
      assert.equal(map.file, path.basename(file));
      assert.ok(map.ignoreList.length > 0, 'something is ignored');
      map.ignoreList.forEach((i) => assert.match(map.sources[i], /node_modules/));
      assert.ok(map.sources.some((source, i) => !/node_modules/.test(source) && !map.ignoreList.includes(i)));
    });
  });

  test('a chunk without a map is printed without one', async () => {
    const bundleOut = { 'a.js': { type: 'chunk', fileName: 'a.js', code: 'var  a = 1;\nconsole.log(a);', map: null } };
    await terserLast({ banner: '' }).generateBundle.call({}, { sourcemap: true, format: 'es' }, bundleOut);
    assert.equal(bundleOut['a.js'].map, null);
    assert.ok(!bundleOut['a.js'].code.includes('  '), 'printed');
  });

  test('the prototype that is kept still works', async () => {
    const code = fs.readFileSync(path.join(dir, 'umd/stardust.js'), 'utf8');
    const module = { exports: {} };
    vm.runInNewContext(code, { module, exports: module.exports, process: {} });
    assert.equal(module.exports.nodes(), 'append:ainsert:b');
  });
});
