import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { rolldown } from 'rolldown';
import { rollup } from 'rollup';
import { createPlan, getBanner } from '../plan.mjs';
import { createRolldownOptions, isIgnoredLog, localeStringValidator } from '../options.mjs';

const pkg = {
  name: '@nebula.js/stardust',
  version: '9.9.9',
  license: 'MIT',
  main: 'index.js',
  peerDependencies: { react: '*' },
};
const banner = getBanner(pkg, 2030);

const write = (dir, files) =>
  Object.entries(files).forEach(([file, content]) => {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), content);
  });

const build = async (dir, bundle, nodeEnv = 'production') => {
  const options = createRolldownOptions(bundle, { pkg, banner, rollup, checkLocale: false, nodeEnv });
  const { output, ...input } = options;
  const b = await rolldown({ ...input, logLevel: 'silent' });
  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const out of output) await b.write(out); // eslint-disable-line no-await-in-loop
  } finally {
    await b.close();
  }
};

const runUmd = (file, { asModule }) => {
  const code = fs.readFileSync(file, 'utf8');
  const react = { createElement: () => 'element' };
  if (asModule) {
    const module = { exports: {} };
    vm.runInNewContext(code, { module, exports: module.exports, require: () => react });
    return module.exports;
  }
  const global = { React: react };
  global.self = global;
  vm.runInNewContext(code, global);
  return global;
};

describe('createRolldownOptions', () => {
  let dir;

  before(() => {
    dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'opts-test-')));
    write(dir, {
      'src/index.js': [
        `import React from 'react';`,
        `import data from './data.json';`,
        `import { flavour } from './flavour';`,
        `export const dev = __NEBULA_DEV__;`,
        `export const env = process.env.NODE_ENV;`,
        `export const version = process.env.NEBULA_VERSION + '/' + process.env.NEBULA_VERSION_HASH;`,
        `export const answer = data.answer;`,
        `export { flavour };`,
        `export const element = () => React.createElement('div');`,
        `export const optional = (o) => o?.a ?? 'none';`,
        `export const spread = (o) => ({ ...o, extra: true });`,
        `export const lazy = () => import('./lazy');`,
        `export default function main() {}`,
        ``,
      ].join('\n'),
      'src/data.json': '{ "answer": 42 }',
      'src/flavour.js': `export const flavour = 'plain';\n`,
      'src/flavour.dev.js': `export const flavour = 'dev';\n`,
      'src/lazy.js': `export const lazy = 'lazy';\n`,
    });
  });

  after(() => fs.rmSync(dir, { recursive: true, force: true }));

  const plan = (overrides) => ({
    label: 'test',
    debug: false,
    minify: true,
    sourcemap: true,
    define: true,
    input: path.join(dir, 'src', 'index'),
    external: ['react'],
    inlineDynamicImports: true,
    outputs: [],
    ...overrides,
  });

  const umd = (file, exports) => ({
    format: 'umd',
    file: path.join(dir, file),
    exports,
    name: 'stardust',
    globals: { react: 'React' },
  });

  test('an umd bundle exports the same named exports as a CommonJS module and as a browser global', async () => {
    await build(dir, plan({ outputs: [umd('named/stardust.js', 'named')] }));
    const file = path.join(dir, 'named/stardust.js');
    const expected = ['answer', 'dev', 'element', 'env', 'flavour', 'lazy', 'optional', 'spread', 'version'];

    const asModule = runUmd(file, { asModule: true });
    assert.deepEqual(
      Object.keys(asModule)
        .filter((k) => k !== 'default')
        .sort(),
      expected
    );
    assert.equal(typeof asModule.default, 'function');

    const asGlobal = runUmd(file, { asModule: false }).stardust;
    assert.deepEqual(
      Object.keys(asGlobal)
        .filter((k) => k !== 'default')
        .sort(),
      expected
    );
  });

  test('an umd bundle with a default export is that export', async () => {
    write(dir, {
      'default/src/index.js': `import React from 'react';\nexport default function main() { return React.createElement('p'); }\n`,
    });
    await build(
      dir,
      plan({
        input: path.join(dir, 'default/src/index'),
        outputs: [{ ...umd('default/out.js', 'default'), name: 'other' }],
      })
    );
    const asModule = runUmd(path.join(dir, 'default/out.js'), { asModule: true });
    assert.equal(typeof asModule, 'function');
    assert.equal(asModule(), 'element');
    const asGlobal = runUmd(path.join(dir, 'default/out.js'), { asModule: false });
    assert.equal(typeof asGlobal.other, 'function');
  });

  test('production: replaces the globals, prefers .js, minifies and starts with the banner', async () => {
    await build(dir, plan({ outputs: [umd('prod/stardust.js', 'named')] }));
    const code = fs.readFileSync(path.join(dir, 'prod/stardust.js'), 'utf8');
    assert.ok(code.startsWith(banner), code.slice(0, 120));
    const exports = runUmd(path.join(dir, 'prod/stardust.js'), { asModule: true });
    assert.equal(exports.dev, false);
    assert.equal(exports.env, 'production');
    assert.match(exports.version, /^9\.9\.9\/[0-9a-f]{4}$/);
    assert.equal(exports.answer, 42);
    assert.equal(exports.flavour, 'plain');
    assert.ok(code.split('\n').length < 20, 'minified');
    assert.ok(fs.existsSync(path.join(dir, 'prod/stardust.js.map')));
  });

  test('dev: __NEBULA_DEV__ is true, .dev.js is preferred and the code is not minified', async () => {
    await build(dir, plan({ debug: true, minify: false, outputs: [umd('dev/stardust.dev.js', 'named')] }));
    const exports = runUmd(path.join(dir, 'dev/stardust.dev.js'), { asModule: true });
    assert.equal(exports.dev, true);
    assert.equal(exports.flavour, 'dev');
    assert.ok(fs.readFileSync(path.join(dir, 'dev/stardust.dev.js'), 'utf8').split('\n').length > 20);
  });

  test('NODE_ENV=development is respected', async () => {
    await build(dir, plan({ outputs: [umd('env/stardust.js', 'named')] }), 'development');
    assert.equal(runUmd(path.join(dir, 'env/stardust.js'), { asModule: true }).env, 'development');
  });

  test('the output is down-levelled for the oldest browsers we support', async () => {
    await build(dir, plan({ minify: false, outputs: [umd('target/stardust.js', 'named')] }));
    const code = fs.readFileSync(path.join(dir, 'target/stardust.js'), 'utf8');
    assert.ok(!code.includes('?.'), 'optional chaining');
    assert.ok(!code.includes('??'), 'nullish coalescing');
    assert.ok(!/\{\s*\.\.\./.test(code), 'object spread');
  });

  test('an es output keeps externals as imports and exports as export', async () => {
    await build(
      dir,
      plan({ outputs: [{ format: 'es', file: path.join(dir, 'esm/stardust.esm.js'), exports: 'named' }] })
    );
    const code = fs.readFileSync(path.join(dir, 'esm/stardust.esm.js'), 'utf8');
    assert.match(code, /from\s*["']react["']/);
    assert.match(code, /export\s*\{/);
    assert.ok(code.startsWith(banner));
  });

  test('a systemjs output is code split, with the chunks in chunks/ and the banner on all of them', async () => {
    await build(
      dir,
      plan({
        inlineDynamicImports: false,
        outputs: [
          { format: 'system', dir: path.join(dir, 'sys'), entryFileName: 'stardust.systemjs.js', exports: 'named' },
        ],
      })
    );
    const entry = fs.readFileSync(path.join(dir, 'sys/stardust.systemjs.js'), 'utf8');
    assert.ok(entry.startsWith(banner));
    assert.match(entry, /System\.register\(\[[^\]]*'react'/);
    const chunks = fs.readdirSync(path.join(dir, 'sys/chunks')).filter((f) => f.endsWith('.js'));
    assert.ok(chunks.length >= 1);
    chunks.forEach((f) => {
      assert.match(f, /^[\w-]+-[\w-]+\.js$/);
      const code = fs.readFileSync(path.join(dir, 'sys/chunks', f), 'utf8');
      assert.ok(code.startsWith(banner));
      assert.match(code, /System\.register\(/);
    });
    assert.ok(fs.existsSync(path.join(dir, 'sys/stardust.systemjs.js.map')));
  });

  test('the plan of a real package gives rolldown options for every output', () => {
    const real = createPlan({ cwd: dir, pkg, corePkg: { module: 'esm/index.js' } });
    real.forEach((bundle) => {
      const options = createRolldownOptions(bundle, { pkg, banner, rollup, checkLocale: true, nodeEnv: 'production' });
      assert.equal(options.output.length, bundle.outputs.length);
      assert.equal(options.platform, 'browser');
      assert.equal(options.plugins.length, 1);
    });
  });
});

describe('isIgnoredLog', () => {
  test('ignores the "use client" directives of MUI', () => {
    assert.ok(
      isIgnoredLog({
        code: 'MODULE_LEVEL_DIRECTIVE',
        message:
          'The semantics of the module level directive "use client" in "node_modules/@mui/material/x.js" are ignored.',
      })
    );
  });

  test('keeps the others', () => {
    assert.ok(!isIgnoredLog({ code: 'MODULE_LEVEL_DIRECTIVE', message: 'the directive "use strict"' }));
    assert.ok(!isIgnoredLog({ code: 'CIRCULAR_DEPENDENCY', message: 'src/a.js -> src/b.js' }));
    assert.ok(!isIgnoredLog({ code: 'UNRESOLVED_IMPORT', message: 'nope' }));
    assert.ok(!isIgnoredLog({ message: 'no code' }));
  });
});

/* eslint-disable no-console */
describe('localeStringValidator', () => {
  const run = (code) => {
    const warnings = [];
    const { warn } = console;
    console.warn = (message) => warnings.push(message);
    try {
      localeStringValidator().transform.handler(code, '/repo/apis/nucleus/src/Component.jsx');
    } finally {
      console.warn = warn;
    }
    return warnings;
  };

  test('reports a string that is not in the locale registry', () => {
    const warnings = run(`export const C = () => <p>{translator.get('Object.Not.In.Registry.Ever')}</p>;`);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /String 'Object\.Not\.In\.Registry\.Ever' does not exist in locale registry/);
  });

  test('is quiet for a string that exists, and reports one it cannot verify', () => {
    const all = JSON.parse(fs.readFileSync(new URL('../../../apis/locale/all.json', import.meta.url), 'utf8'));
    const [{ id }] = Object.values(all);
    assert.deepEqual(run(`translator.get('${id}');`), []);
    const warnings = run(`translator.get(someVariable);`);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /Could not verify used string at \/repo\/apis\/nucleus\/src\/Component\.jsx:1:/);
  });

  test('does not change the code', () => {
    assert.equal(localeStringValidator().transform.handler(`translator.get('x')`, '/repo/apis/nucleus/src/a.js'), null);
  });
});
