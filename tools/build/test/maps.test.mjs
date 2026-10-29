import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { TraceMap, eachMapping, originalPositionFor } from '@jridgewell/trace-mapping';
import { buildTo, write } from './helpers.mjs';

// String literals that are in the original files, to find in the generated code
const MARKS = { entry: 'MARK_ENTRY', shared: 'MARK_SHARED', lazy: 'MARK_LAZY', lazyOnly: 'MARK_ONLY_IN_LAZY' };

const files = {
  'src/index.js': [
    `import { shared } from './shared.js';`,
    `import { padding } from './padding.js';`,
    `export const entry = () => {`,
    `  padding();`,
    `  return shared('${MARKS.entry}');`,
    `};`,
    `export const loadLazy = () => import('./lazy.js');`,
    ``,
  ].join('\n'),
  'src/padding.js': Array.from({ length: 30 }, (_, i) => `export const pad${i} = () => 'pad${i}';`)
    .concat(`export const padding = () => pad1() + pad2();`, '')
    .join('\n'),
  'src/shared.js': `export const shared = (s) => {\n  return s + '${MARKS.shared}';\n};\n`,
  'src/lazy.js': [
    `import { shared } from './shared.js';`,
    ``,
    `export const lazy = () => shared('${MARKS.lazy}');`,
    `export const only = () => {`,
    `  return '${MARKS.lazyOnly}';`,
    `};`,
    ``,
  ].join('\n'),
};

const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));

/** Asserts that the map of `file` is a map of its code, and returns what is needed to look at tokens */
const readMapped = (file) => {
  const code = fs.readFileSync(file, 'utf8');
  const lines = code.split('\n');
  const mapFile = `${file}.map`;
  assert.ok(fs.existsSync(mapFile), `${file} has a map`);
  assert.ok(code.includes(`sourceMappingURL=${path.basename(mapFile)}`), 'refers to its map');
  const raw = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
  const trace = new TraceMap(raw);
  eachMapping(trace, (m) => {
    // trace-mapping lines are 1 based, columns 0 based
    assert.ok(m.generatedLine <= lines.length, `${path.basename(file)}: line ${m.generatedLine} of ${lines.length}`);
    assert.ok(
      m.generatedColumn <= lines[m.generatedLine - 1].length,
      `${path.basename(file)}:${m.generatedLine} column ${m.generatedColumn}`
    );
  });
  // the files in the map exist, relative to the map, and their content is what is on disk
  raw.sources.forEach((source, i) => {
    const original = path.resolve(path.dirname(mapFile), source);
    assert.ok(fs.existsSync(original), `${source} exists`);
    assert.equal(raw.sourcesContent[i], fs.readFileSync(original, 'utf8'));
  });
  return { code, lines, trace, raw, mapFile };
};

/** The line of the original source that the position of `token` in the generated code maps to */
const originOf = ({ lines, trace, mapFile }, token) => {
  const line = lines.findIndex((l) => l.includes(token));
  assert.notEqual(line, -1, `${token} is in the generated code`);
  const column = lines[line].indexOf(token);
  const pos = originalPositionFor(trace, { line: line + 1, column });
  assert.ok(pos.source, `${token} is mapped`);
  const file = path.resolve(path.dirname(mapFile), pos.source);
  return { file, text: fs.readFileSync(file, 'utf8').split('\n')[pos.line - 1] };
};

describe('source maps on disk', () => {
  let dir;

  before(() => {
    dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'maps-test-')));
    write(dir, files);
  });

  after(() => fs.rmSync(dir, { recursive: true, force: true }));

  const plan = (debug, outputs, inline) => ({
    label: 'test',
    debug,
    minify: !debug,
    sourcemap: true,
    define: true,
    input: path.join(dir, 'src', 'index'),
    external: [],
    inlineDynamicImports: inline,
    outputs,
  });

  const system = (out) => ({
    format: 'system',
    dir: path.join(dir, out),
    entryFileName: 'stardust.systemjs.js',
    exports: 'named',
  });

  [false, true].forEach((debug) => {
    const out = debug ? 'sys-dev' : 'sys-prod';
    test(`${debug ? 'dev' : 'prod'} systemjs: the maps on disk map the converted code of the entry and of the chunks`, async () => {
      await buildTo(dir, plan(debug, [system(out)], false));
      const js = walk(path.join(dir, out)).filter((f) => f.endsWith('.js'));
      assert.ok(
        js.some((f) => f.includes(`${path.sep}chunks${path.sep}`)),
        'there are chunks'
      );
      const mapped = js.map((f) => readMapped(f));

      const find = (mark) => mapped.find(({ code }) => code.includes(mark));
      const check = (mark, source, line) => {
        const o = originOf(find(mark), mark);
        assert.equal(o.file, path.join(dir, 'src', source));
        assert.match(o.text, new RegExp(line));
      };
      check(MARKS.entry, 'index.js', `shared\\('${MARKS.entry}'\\)`);
      check(MARKS.shared, 'shared.js', MARKS.shared);
      check(MARKS.lazyOnly, 'lazy.js', MARKS.lazyOnly);
      check(MARKS.lazy, 'lazy.js', `shared\\('${MARKS.lazy}'\\)`);
    });
  });

  test('an es output maps its code too', async () => {
    await buildTo(
      dir,
      plan(true, [{ format: 'es', file: path.join(dir, 'es/stardust.esm.js'), exports: 'named' }], true)
    );
    const mapped = readMapped(path.join(dir, 'es/stardust.esm.js'));
    assert.equal(originOf(mapped, MARKS.lazyOnly).file, path.join(dir, 'src', 'lazy.js'));
  });

  test('a minified es output maps its code through the compression and Terser', async () => {
    await buildTo(
      dir,
      plan(false, [{ format: 'es', file: path.join(dir, 'es-prod/stardust.esm.js'), exports: 'named' }], true)
    );
    const mapped = readMapped(path.join(dir, 'es-prod/stardust.esm.js'));
    assert.ok(mapped.lines.length < 10, 'minified');
    assert.equal(originOf(mapped, MARKS.lazyOnly).file, path.join(dir, 'src', 'lazy.js'));
    assert.match(originOf(mapped, MARKS.shared).text, new RegExp(MARKS.shared));
    assert.match(originOf(mapped, MARKS.entry).text, new RegExp(`shared\\('${MARKS.entry}'\\)`));
  });

  [false, true].forEach((debug) => {
    test(`${debug ? 'dev' : 'prod'} umd: strict inside the factory, and the map is still a map of the code`, async () => {
      const file = path.join(dir, `umd-${debug}`, 'stardust.js');
      await buildTo(dir, plan(debug, [{ format: 'umd', file, exports: 'named', name: 'stardust' }], true));
      const mapped = readMapped(file);
      assert.match(mapped.code, /\}\)?\(this,\s*function\s*\([^)]*\)\s*\{\s*["']use strict["']/);
      assert.equal(mapped.code.match(/use strict/g).length, 1);
      const entry = originOf(mapped, MARKS.entry);
      assert.equal(entry.file, path.join(dir, 'src', 'index.js'));
      assert.match(entry.text, /MARK_ENTRY/);
      assert.equal(originOf(mapped, MARKS.shared).file, path.join(dir, 'src', 'shared.js'));
    });
  });

  test('an es output has no directive', async () => {
    await buildTo(dir, plan(true, [{ format: 'es', file: path.join(dir, 'es-strict/a.js'), exports: 'named' }], true));
    assert.ok(!fs.readFileSync(path.join(dir, 'es-strict/a.js'), 'utf8').includes('use strict'));
  });
});
