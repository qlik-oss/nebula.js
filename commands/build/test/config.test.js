import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import config from '../lib/config.js';
import systemjsBehaviours from '../lib/systemjs.js';

const makeProject = (pkg = {}, files = {}) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nebula-build-config-'));
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({
      name: '@acme/viz',
      version: '1.0.0',
      license: 'MIT',
      author: 'Acme <a@acme.test>',
      main: 'dist/viz.js',
      module: 'dist/viz.esm.js',
      systemjs: 'dist/viz.systemjs.js',
      peerDependencies: { '@nebula.js/stardust': '*', react: '*' },
      ...pkg,
    })
  );
  Object.entries(files).forEach(([name, content]) => {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), content);
  });
  return dir;
};

const argv = (extra = {}) => ({ sourcemap: true, codeSplit: false, inlineDynamic: false, ...extra });

// the rslib configuration of a build, and the rspack configuration that the build of it ends up with
const libOf = (cfg) => cfg.config.lib[0];
const rspackOf = (cfg) =>
  libOf(cfg).tools.rspack({ output: {}, resolve: {}, module: {}, optimization: {}, plugins: [] });

describe('build config', () => {
  it('writes an esm bundle to package.json module and skips it when there is none', () => {
    const cwd = makeProject();
    const behaviours = { getOutputFile: ({ pkg }) => pkg.module, enabled: ({ pkg }) => !!pkg.module };
    const cfg = config({ format: 'esm', cwd, argv: argv(), behaviours });
    assert.equal(libOf(cfg).format, 'esm');
    assert.equal(libOf(cfg).output.filename.js, 'viz.esm.js');
    assert.equal(rspackOf(cfg).externalsType, 'module-import');

    const none = makeProject({ module: undefined });
    assert.equal(config({ format: 'esm', cwd: none, argv: argv(), behaviours }), false);
  });

  it('writes a systemjs bundle to package.json systemjs, without a name', () => {
    const cwd = makeProject();
    const cfg = config({ format: 'systemjs', cwd, argv: argv(), behaviours: systemjsBehaviours });
    assert.equal(libOf(cfg).output.filename.js, 'viz.systemjs.js');
    assert.deepEqual(rspackOf(cfg).output.library, { type: 'system' });
    assert.equal(rspackOf(cfg).externalsType, 'system');

    const none = makeProject({ systemjs: undefined });
    assert.equal(config({ format: 'systemjs', cwd: none, argv: argv(), behaviours: systemjsBehaviours }), false);
  });

  it('builds into the core package when asked to', () => {
    const cwd = makeProject();
    const core = path.join(cwd, 'core');
    fs.mkdirSync(core);
    fs.writeFileSync(path.join(core, 'package.json'), JSON.stringify({ name: '@acme/core', module: 'esm/core.js' }));
    const cfg = config({
      format: 'esm',
      cwd,
      core,
      argv: argv(),
      behaviours: { getOutputFile: ({ pkg }) => pkg.module, enabled: ({ pkg }) => !!pkg.module },
    });
    assert.equal(libOf(cfg).output.distPath.root, path.join(core, 'esm'));
    assert.equal(libOf(cfg).output.filename.js, 'core.js');
  });

  it('minifies in production only', () => {
    const cwd = makeProject();
    assert.equal(libOf(config({ mode: 'production', format: 'esm', cwd, argv: argv() })).output.minify, true);
    assert.equal(libOf(config({ mode: 'development', format: 'esm', cwd, argv: argv() })).output.minify, false);
  });

  it('does not import jsx-dev-runtime in development, the host of react does not have it', () => {
    const cwd = makeProject();
    const react = (mode) => libOf(config({ mode, format: 'esm', cwd, argv: argv() })).tools.swc.jsc.transform.react;
    assert.equal(react('development').development, false);
    assert.equal(react('production').development, false);
  });

  it('rejects replacementStrings that is not an object', () => {
    const cwd = makeProject();
    assert.throws(
      () => config({ format: 'esm', cwd, argv: argv({ replacementStrings: 'nope' }) }),
      /replacementStrings should be an object/
    );
  });

  it('defines the replacementStrings and process.env.NODE_ENV', () => {
    const cwd = makeProject();
    const { define } = libOf(
      config({ format: 'esm', cwd, argv: argv({ replacementStrings: { __V__: '"1"' } }) })
    ).source;
    assert.deepEqual(define, { 'process.env.NODE_ENV': '"production"', __V__: '"1"' });
  });

  it('emits source maps only when asked to', () => {
    const cwd = makeProject();
    assert.deepEqual(libOf(config({ format: 'esm', cwd, argv: argv({ sourcemap: true }) })).output.sourceMap, {
      js: 'source-map',
    });
    assert.equal(libOf(config({ format: 'esm', cwd, argv: argv({ sourcemap: false }) })).output.sourceMap, false);
  });

  it('adds the typescript extensions only with the typescript option', () => {
    const cwd = makeProject();
    assert.deepEqual(rspackOf(config({ format: 'esm', cwd, argv: argv() })).resolve.extensions, [
      '.mjs',
      '.js',
      '.jsx',
      '.json',
    ]);
    assert.deepEqual(rspackOf(config({ format: 'esm', cwd, argv: argv({ typescript: true }) })).resolve.extensions, [
      '.mjs',
      '.js',
      '.jsx',
      '.json',
      '.tsx',
      '.ts',
    ]);
  });

  it('prefers .native files for react native builds', () => {
    const cwd = makeProject();
    fs.mkdirSync(path.join(cwd, 'react-native'));
    fs.writeFileSync(
      path.join(cwd, 'react-native', 'package.json'),
      JSON.stringify({
        name: '@acme/viz-rn',
        module: 'dist/rn.esm.js',
        peerDependencies: { '@nebula.js/stardust': '*' },
      })
    );
    const cfg = config({
      format: 'esm',
      cwd,
      argv: argv({ reactNative: true, reactNativePath: path.join(cwd, 'react-native') }),
    });
    assert.deepEqual(rspackOf(cfg).resolve.extensions.slice(0, 4), ['.native.mjs', '.mjs', '.native.js', '.js']);
    assert.equal(libOf(cfg).output.filename.js, 'rn.esm.js');
  });

  it('builds a single file unless code splitting is asked for', () => {
    const cwd = makeProject();
    const behaviours = { getOutputFile: ({ pkg }) => pkg.module, enabled: () => true };
    const isLimited = (cfg) => rspackOf(cfg).plugins.some((p) => p.name === 'LimitChunkCountPlugin');

    const single = config({ format: 'esm', cwd, argv: argv(), behaviours });
    assert.equal(isLimited(single), true);
    assert.equal(rspackOf(single).output.asyncChunks, false);
    const split = config({ format: 'esm', cwd, argv: argv({ codeSplit: true }), behaviours });
    assert.equal(isLimited(split), false);
    assert.equal(rspackOf(split).output.asyncChunks, undefined);
    assert.equal(libOf(split).output.distPath.root, path.join(cwd, 'dist'));
    assert.equal(libOf(split).output.filename.js, 'viz.esm.js');
    assert.deepEqual(Object.keys(libOf(split).source.entry), ['viz.esm']);
    assert.equal(rspackOf(split).output.chunkFilename, 'viz.esm.[name]-[contenthash].js');
    // inlineDynamic forces one file for the other formats too
    assert.equal(
      isLimited(config({ format: 'esm', cwd, argv: argv({ codeSplit: true, inlineDynamic: true }), behaviours })),
      true
    );
  });

  it('writes a code split bundle where the package field names it, with chunks that do not collide', () => {
    const cwd = makeProject({ module: 'lib/out/viz.esm.js', systemjs: 'lib/out/viz.systemjs.js' });
    const es = config({
      format: 'esm',
      cwd,
      argv: argv({ codeSplit: true }),
      behaviours: { getOutputFile: ({ pkg }) => pkg.module },
    });
    const system = config({
      format: 'systemjs',
      cwd,
      argv: argv({ codeSplit: true }),
      behaviours: systemjsBehaviours,
    });
    assert.equal(libOf(es).output.distPath.root, path.join(cwd, 'lib/out'));
    assert.equal(libOf(system).output.distPath.root, path.join(cwd, 'lib/out'));
    assert.equal(libOf(es).output.filename.js, 'viz.esm.js');
    assert.equal(libOf(system).output.filename.js, 'viz.systemjs.js');
    assert.deepEqual(Object.keys(libOf(system).source.entry), ['viz.systemjs']);
    assert.notEqual(rspackOf(es).output.chunkFilename, rspackOf(system).output.chunkFilename);
  });

  it('always keeps stardust and the peer dependencies external', () => {
    const cwd = makeProject({ peerDependencies: { react: '*' } });
    const { warn } = console;
    const warnings = [];
    console.warn = (m) => warnings.push(m);
    try {
      const cfg = config({ format: 'esm', cwd, argv: argv() });
      assert.ok(libOf(cfg).output.externals.length > 0);
      assert.match(warnings.join('\n'), /@nebula\.js\/stardust should be specified as a peer dependency/);
    } finally {
      console.warn = warn;
    }
  });

  it('leaves a package out of a systemjs bundle by its name, and the modules of it out of an es module bundle', () => {
    const cwd = makeProject();
    const externalsOf = (format) => libOf(config({ format, cwd, argv: argv() })).output.externals;
    const matches = (format, id) => externalsOf(format).some((rx) => rx.test(id));
    assert.ok(matches('systemjs', 'react'));
    assert.ok(!matches('systemjs', 'react/jsx-runtime'));
    assert.ok(!matches('systemjs', 'react-dom/client'));
    assert.ok(matches('esm', 'react'));
    assert.ok(matches('esm', 'react/jsx-runtime'));
    assert.ok(!matches('esm', 'reactive'));
  });

  it('keeps a regular expression external as it is', () => {
    const cwd = makeProject();
    const rx = /^react\/.*$/;
    const cfg = config({ format: 'systemjs', cwd, argv: argv(), behaviours: { getExternal: () => [rx] } });
    assert.ok(libOf(cfg).output.externals.includes(rx));
  });

  it('does not warn about stardust when a regular expression matches it', () => {
    const cwd = makeProject();
    const { warn } = console;
    const warnings = [];
    console.warn = (m) => warnings.push(m);
    try {
      config({ format: 'esm', cwd, argv: argv(), behaviours: { getExternal: () => [/^@nebula\.js\//] } });
      assert.deepEqual(warnings, []);
    } finally {
      console.warn = warn;
    }
  });

  it('keys the build cache on what the output depends on and on nebula.config.js', () => {
    const cwd = makeProject({}, { 'nebula.config.js': 'module.exports = {};\n' });
    const cache = (extra, mode) =>
      libOf(config({ format: 'systemjs', mode, cwd, argv: argv(extra), behaviours: systemjsBehaviours })).performance
        .buildCache;
    assert.deepEqual(cache({ config: 'nebula.config.js' }).buildDependencies, [path.join(cwd, 'nebula.config.js')]);
    assert.deepEqual(cache({}).buildDependencies, []);
    const digest = (extra, mode) => cache(extra, mode).cacheDigest;
    assert.notDeepEqual(digest({ replacementStrings: { a: '1' } }), digest({ replacementStrings: { a: '2' } }));
    assert.notDeepEqual(digest({ systemjs: { external: [/^a$/] } }), digest({ systemjs: { external: [/^b$/] } }));
    assert.notDeepEqual(digest({}, 'development'), digest({}, 'production'));
    assert.deepEqual(digest({ typescript: true }), digest({ typescript: true }));
  });
});
