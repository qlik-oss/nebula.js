/* eslint-disable import/extensions, no-console */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { TraceMap, eachMapping, originalPositionFor } from '@jridgewell/trace-mapping';

import build from '../lib/build.js';

// The source maps on disk have to map the code that is on disk, in every format, for the production and the development
// builds, and the converted SystemJS code is not the code that Rolldown made: its map is chained and written again.

const MARKS = { entry: 'MARK_ENTRY', shared: 'MARK_SHARED', lazy: 'MARK_LAZY', lazyOnly: 'MARK_ONLY_IN_LAZY' };

const files = {
  'package.json': JSON.stringify({
    name: '@acme/viz',
    version: '1.0.0',
    license: 'MIT',
    main: 'dist/viz.js',
    module: 'dist/viz.esm.js',
    systemjs: 'dist/viz.systemjs.js',
    peerDependencies: { '@nebula.js/stardust': '*' },
  }),
  'src/index.js': [
    `import { shared } from './shared.js';`,
    `import { padding } from './padding.js';`,
    `export default function supernova() {`,
    `  padding();`,
    `  return { render: () => shared('${MARKS.entry}'), load: () => import('./lazy.js') };`,
    `}`,
    ``,
  ].join('\n'),
  'src/padding.js': Array.from({ length: 30 }, (_, i) => `export const pad${i} = () => 'pad${i}';`)
    .concat(`export const padding = () => pad1() + pad2();`, '')
    .join('\n'),
  'src/shared.js': `export const shared = (s) => {\n  return s + '${MARKS.shared}';\n};\n`,
  'src/lazy.js': [
    `import { shared } from './shared.js';`,
    ``,
    `export default () => shared('${MARKS.lazy}');`,
    `export const only = () => {`,
    `  return '${MARKS.lazyOnly}';`,
    `};`,
    ``,
  ].join('\n'),
};

const write = (dir, tree) =>
  Object.entries(tree).forEach(([file, content]) => {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), content);
  });

/** Asserts that the map of `file` is a map of its code, and returns what is needed to look at tokens */
const readMapped = (file) => {
  const code = fs.readFileSync(file, 'utf8');
  const lines = code.split('\n');
  const mapFile = `${file}.map`;
  assert.ok(fs.existsSync(mapFile), `${path.basename(file)} has a map`);
  assert.ok(code.includes(`sourceMappingURL=${path.basename(mapFile)}`), 'refers to its map');
  assert.equal(code.split('sourceMappingURL=').length - 1, 1, 'refers to a map once');
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
  // the sources are relative to the map, they exist and their content is what is on disk
  raw.sources.forEach((source, i) => {
    assert.ok(!path.isAbsolute(source), `${source} is relative`);
    const original = path.resolve(path.dirname(mapFile), source);
    assert.ok(fs.existsSync(original), `${source} exists`);
    if (raw.sourcesContent) {
      assert.equal(raw.sourcesContent[i], fs.readFileSync(original, 'utf8'));
    }
  });
  return { code, lines, trace, mapFile };
};

/** The line of the original source that the position of `token` in the generated code maps to */
const originOf = ({ lines, trace, mapFile }, token) => {
  const line = lines.findIndex((l) => l.includes(token));
  assert.notEqual(line, -1, `${token} is in the generated code`);
  const pos = originalPositionFor(trace, { line: line + 1, column: lines[line].indexOf(token) });
  assert.ok(pos.source, `${token} is mapped`);
  const file = path.resolve(path.dirname(mapFile), pos.source);
  return { file, text: fs.readFileSync(file, 'utf8').split('\n')[pos.line - 1] };
};

describe('source maps on disk', () => {
  let root;
  let counter = 0;
  const originalLog = console.log;
  const originalWarn = console.warn;

  before(() => {
    root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nebula-maps-')));
    console.log = () => {};
    console.warn = () => {};
    console.time = () => {};
    console.timeEnd = () => {};
  });

  after(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    fs.rmSync(root, { recursive: true, force: true });
  });

  const project = async (options, { module = true } = {}) => {
    counter += 1;
    const dir = path.join(root, `p${counter}`);
    write(dir, files);
    if (!module) {
      // without an esm bundle, which would leave its chunks in the directory of the systemjs bundle
      write(dir, { 'package.json': JSON.stringify({ ...JSON.parse(files['package.json']), module: undefined }) });
    }
    write(dir, {
      'node_modules/@nebula.js/stardust/package.json': JSON.stringify({
        name: '@nebula.js/stardust',
        main: 'index.js',
      }),
      'node_modules/@nebula.js/stardust/index.js': 'exports.x = 1;\n',
    });
    await build({ cwd: dir, ...options });
    return dir;
  };

  const check = (mapped, mark, source, line) => {
    const found = mapped.find(({ code }) => code.includes(mark));
    assert.ok(found, `${mark} is in a bundle`);
    const origin = originOf(found, mark);
    assert.equal(path.basename(origin.file), source);
    assert.match(origin.text, new RegExp(line));
  };

  ['production', 'development'].forEach((mode) => {
    it(`maps the umd, esm and systemjs bundles to their sources in ${mode}`, async () => {
      const dir = await project({ mode, inlineDynamic: true });
      ['viz.js', 'viz.esm.js', 'viz.systemjs.js'].forEach((name) => {
        const mapped = readMapped(path.join(dir, 'dist', name));
        check([mapped], MARKS.entry, 'index.js', `shared\\('${MARKS.entry}'\\)`);
        check([mapped], MARKS.shared, 'shared.js', MARKS.shared);
        check([mapped], MARKS.lazyOnly, 'lazy.js', MARKS.lazyOnly);
        check([mapped], MARKS.lazy, 'lazy.js', `shared\\('${MARKS.lazy}'\\)`);
      });
    });

    it(`maps the entry and the chunks of a code split systemjs bundle in ${mode}`, async () => {
      const dir = await project({ mode, codeSplit: true }, { module: false });
      const js = fs
        .readdirSync(path.join(dir, 'dist'))
        .filter((f) => f.endsWith('.js') && f !== 'viz.js')
        .map((f) => path.join(dir, 'dist', f));
      assert.ok(js.length >= 2, `an entry and a chunk, got ${js.map((f) => path.basename(f))}`);
      // the bundle in the directory is the systemjs one, the esm bundle was overwritten
      assert.ok(
        js.every((f) => /System\.register/.test(fs.readFileSync(f, 'utf8'))),
        'all are SystemJS modules'
      );
      const mapped = js.map(readMapped);
      check(mapped, MARKS.entry, 'index.js', `shared\\('${MARKS.entry}'\\)`);
      check(mapped, MARKS.lazyOnly, 'lazy.js', MARKS.lazyOnly);
    });
  });

  it('writes the converted map of the systemjs bundle to its .map file, not the one of the es code', async () => {
    const dir = await project({ mode: 'production', inlineDynamic: true });
    const code = fs.readFileSync(path.join(dir, 'dist/viz.systemjs.js'), 'utf8');
    // the position of a token of the converted code is only found in the converted map
    const mapped = readMapped(path.join(dir, 'dist/viz.systemjs.js'));
    assert.match(code, /^\/\*[\s\S]*\*\/\s*System\.register\(/);
    const lines = code.split('\n');
    assert.ok(lines.length > 5, 'the wrapper has lines of its own');
    assert.equal(path.basename(originOf(mapped, MARKS.shared).file), 'shared.js');
  });

  it('leaves out the map and the reference to it with sourcemap: false', async () => {
    const dir = await project({ sourcemap: false, inlineDynamic: true });
    ['viz.js', 'viz.esm.js', 'viz.systemjs.js'].forEach((name) => {
      assert.equal(fs.existsSync(path.join(dir, 'dist', `${name}.map`)), false);
      assert.doesNotMatch(fs.readFileSync(path.join(dir, 'dist', name), 'utf8'), /sourceMappingURL/);
    });
  });
});
