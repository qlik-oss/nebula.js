import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { rolldown } from 'rolldown';
import { rollup } from 'rollup';
import esmToSystemJs from '../esm-to-systemjs.mjs';

const BANNER = '/*\n* test v1.0.0\n*/\n';

const bySource = (chunks, fileName) => chunks.find((c) => c.fileName === fileName);

// Decodes the mappings of a source map to [generatedLine, generatedColumn, sourceIndex, line, column] segments
const decodeMappings = ({ mappings }) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const segments = [];
  let source = 0;
  let line = 0;
  let column = 0;
  mappings.split(';').forEach((generated, generatedLine) => {
    let generatedColumn = 0;
    generated
      .split(',')
      .filter(Boolean)
      .forEach((segment) => {
        const values = [];
        let shift = 0;
        let value = 0;
        [...segment].forEach((char) => {
          const digit = chars.indexOf(char);
          value += (digit & 31) << shift;
          if (digit & 32) shift += 5;
          else {
            values.push(value & 1 ? -(value >> 1) : value >> 1);
            shift = 0;
            value = 0;
          }
        });
        generatedColumn += values[0];
        if (values.length > 1) {
          source += values[1];
          line += values[2];
          column += values[3];
          segments.push([generatedLine, generatedColumn, source, line, column]);
        }
      });
  });
  return segments;
};

// Where in the original sources the first occurrence of `token` in `code` came from: { file, text } of that line
const originOf = (code, map, token, dir) => {
  const lines = code.split('\n');
  const generatedLine = lines.findIndex((l) => l.includes(token));
  const generatedColumn = lines[generatedLine].indexOf(token);
  const segment = decodeMappings(map)
    .filter(([l, c]) => l === generatedLine && c <= generatedColumn)
    .pop();
  const [, , source, line] = segment;
  return { file: path.resolve(dir, map.sources[source]), text: map.sourcesContent[source].split('\n')[line] };
};

// A minimal System.register loader for the converted chunks
const load = async (chunks, entry, externals = {}) => {
  const instances = new Map();
  const instantiate = async (fileName) => {
    if (instances.has(fileName)) return instances.get(fileName);
    const chunk = bySource(chunks, fileName);
    let registered;
    vm.runInNewContext(chunk.code, {
      System: {
        register: (deps, declare) => {
          registered = { deps, declare };
        },
      },
    });
    const exports = {};
    instances.set(fileName, exports);
    const { setters = [], execute } = registered.declare(
      (name, value) => {
        if (typeof name === 'string') exports[name] = value;
        else Object.assign(exports, name);
        return value;
      },
      { import: (spec) => instantiate(path.posix.join(path.posix.dirname(fileName), spec)) }
    );
    await Promise.all(
      registered.deps.map(async (dep, i) => {
        const imported = dep.startsWith('.')
          ? await instantiate(path.posix.join(path.posix.dirname(fileName), dep))
          : externals[dep];
        setters[i](imported);
      })
    );
    await execute();
    return exports;
  };
  return instantiate(entry);
};

describe('esm-to-systemjs', () => {
  let dir;
  let es;

  before(async () => {
    dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'sjs-test-')));
    fs.mkdirSync(path.join(dir, 'src'));
    fs.writeFileSync(path.join(dir, 'src', 'shared.js'), 'export const shared = (n) => n + 1;\n');
    fs.writeFileSync(
      path.join(dir, 'src', 'lazy.js'),
      `import { shared } from './shared.js';\nexport const lazyValue = shared(10);\nexport default function lazyDefault() {\n  return 'lazy';\n}\n`
    );
    fs.writeFileSync(
      path.join(dir, 'src', 'index.js'),
      [
        `import React from 'react';`,
        `import { shared } from './shared.js';`,
        `export const entryValue = shared(1);`,
        `export const reactName = React.name;`,
        `export const loadLazy = () => import('./lazy.js');`,
        `export default function entryDefault() {`,
        `  return 'entry';`,
        `}`,
        ``,
      ].join('\n')
    );

    // The ES chunks the same way as they come out of the build: written to chunks/ in a dist directory
    const bundle = await rolldown({
      input: path.join(dir, 'src', 'index.js'),
      external: ['react'],
      logLevel: 'silent',
    });
    const { output } = await bundle.generate({
      dir: path.join(dir, 'dist'),
      format: 'es',
      entryFileNames: 'entry.js',
      chunkFileNames: 'chunks/[name]-[hash].js',
      sourcemap: true,
    });
    await bundle.close();
    es = output.filter((o) => o.type === 'chunk').map(({ fileName, code, map }) => ({ fileName, code, map }));
  });

  after(() => fs.rmSync(dir, { recursive: true, force: true }));

  test('the input has chunks that import each other', () => {
    assert.ok(es.length >= 3, `expected an entry and two chunks, got ${es.map((c) => c.fileName)}`);
    assert.ok(es.some((c) => c.fileName.startsWith('chunks/')));
  });

  test('converts every chunk to System.register and keeps the relative imports between chunks', async () => {
    const out = await esmToSystemJs({ rollup, outDir: path.join(dir, 'dist'), chunks: es });
    assert.deepEqual(
      out.map((c) => c.fileName),
      es.map((c) => c.fileName)
    );
    out.forEach(({ code }) => assert.match(code, /System\.register\(/));

    const registered = (code) =>
      [...code.matchAll(/System\.register\((\[[^\]]*\])/g)].map(([, deps]) => JSON.parse(deps.replace(/'/g, '"')));
    const entry = bySource(out, 'entry.js');
    const [entryDeps] = registered(entry.code);
    // same specifiers as the ES entry imports: the shared chunk by a relative path and the external as it is
    const esImports = [...bySource(es, 'entry.js').code.matchAll(/from\s*["']([^"']+)["']/g)].map((m) => m[1]);
    assert.deepEqual([...entryDeps].sort(), [...esImports].sort());
    assert.ok(entryDeps.includes('react'));
    assert.ok(entryDeps.some((d) => /^\.\/chunks\/.+\.js$/.test(d)));

    // a chunk in chunks/ imports its siblings with ./ and not with a path from the root
    const lazy = out.find((c) => c.fileName.startsWith('chunks/') && /lazyValue/.test(c.code));
    assert.deepEqual(
      registered(lazy.code)[0]
        .filter((d) => d.startsWith('.'))
        .map((d) => d.replace(/-[\w-]+\.js$/, '.js')),
      ['./shared.js']
    );
  });

  test('the converted chunks run, with the same named and default exports as the ES entry', async () => {
    const out = await esmToSystemJs({ rollup, outDir: path.join(dir, 'dist'), chunks: es });
    const react = { name: 'React' };
    const exports = await load(out, 'entry.js', { react: { default: react } });
    assert.deepEqual(Object.keys(exports).sort(), ['default', 'entryValue', 'loadLazy', 'reactName']);
    assert.equal(exports.entryValue, 2);
    assert.equal(exports.default(), 'entry');
    assert.equal(exports.reactName, 'React');
    const lazy = await exports.loadLazy();
    assert.equal(lazy.lazyValue, 11);
    assert.equal(lazy.default(), 'lazy');
  });

  test('puts the banner first in every chunk', async () => {
    const out = await esmToSystemJs({ rollup, outDir: path.join(dir, 'dist'), chunks: es, banner: BANNER });
    out.forEach(({ code }) => assert.ok(code.startsWith(BANNER), code.slice(0, 80)));
    const without = await esmToSystemJs({ rollup, outDir: path.join(dir, 'dist'), chunks: es });
    without.forEach(({ code }) => assert.ok(!code.includes('test v1.0.0')));
  });

  test('chains the source maps, with sources relative to the chunk like in the input', async () => {
    const out = await esmToSystemJs({ rollup, outDir: path.join(dir, 'dist'), chunks: es });
    out.forEach(({ fileName, map }) => {
      const input = bySource(es, fileName).map;
      assert.ok(map, `${fileName} has a map`);
      // the same files, as the same relative paths: nothing from the place where the conversion happens
      assert.deepEqual([...map.sources].sort(), [...input.sources].sort());
      map.sources.forEach((source) => {
        assert.ok(!path.isAbsolute(source), source);
        const original = path.resolve(dir, 'dist', path.dirname(fileName), source);
        assert.ok(fs.existsSync(original), `${source} should resolve to a file from ${fileName}`);
      });
    });

    // and what is mapped is still the right code
    const entry = bySource(out, 'entry.js');
    const origin = originOf(entry.code, entry.map, 'entryValue', path.join(dir, 'dist'));
    assert.equal(origin.file, path.join(dir, 'src', 'index.js'));
    assert.match(origin.text, /entryValue/);

    const lazy = out.find((c) => /lazyValue/.test(c.code) && c.fileName !== 'entry.js');
    const lazyOrigin = originOf(lazy.code, lazy.map, 'lazyValue', path.join(dir, 'dist', path.dirname(lazy.fileName)));
    assert.equal(lazyOrigin.file, path.join(dir, 'src', 'lazy.js'));
    assert.match(lazyOrigin.text, /lazyValue/);
  });

  test('has no maps when asked not to', async () => {
    const out = await esmToSystemJs({ rollup, outDir: path.join(dir, 'dist'), chunks: es, sourcemap: false });
    out.forEach(({ map }) => assert.equal(map, null));
  });

  test('converts chunks that have no map', async () => {
    const out = await esmToSystemJs({
      rollup,
      outDir: path.join(dir, 'dist'),
      chunks: es.map(({ fileName, code }) => ({ fileName, code })),
    });
    const exports = await load(out, 'entry.js', { react: { default: { name: 'R' } } });
    assert.equal(exports.entryValue, 2);
  });
});
