/* eslint-disable import/extensions, no-console, no-underscore-dangle */
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

describe('build config', () => {
  it('writes the umd bundle to package.json main, named after the package', () => {
    const cwd = makeProject();
    const cfg = config({ format: 'umd', cwd, argv: argv() });
    assert.equal(cfg.output.path, path.join(cwd, 'dist'));
    assert.equal(cfg.output.filename, 'viz.js');
    assert.deepEqual(cfg.output.library, { name: 'viz', type: 'umd' });
    // goes through the entry that normalises the exports
    assert.match(cfg.entry, /umd-entry\.cjs$/);
    assert.equal(cfg.resolve.alias.__nebula_build_entry__, path.join(cwd, 'src/index'));
  });

  it('writes an esm bundle to package.json module and skips it when there is none', () => {
    const cwd = makeProject();
    const behaviours = { getOutputFile: ({ pkg }) => pkg.module, enabled: ({ pkg }) => !!pkg.module };
    const cfg = config({ format: 'esm', cwd, argv: argv(), behaviours });
    assert.equal(cfg.output.filename, 'viz.esm.js');
    assert.equal(cfg.output.module, true);
    assert.deepEqual(cfg.output.library, { type: 'module' });
    assert.equal(cfg.experiments.outputModule, true);
    assert.equal(cfg.externalsType, 'module-import');

    const none = makeProject({ module: undefined });
    assert.equal(config({ format: 'esm', cwd: none, argv: argv(), behaviours }), false);
  });

  it('writes a systemjs bundle to package.json systemjs, without a name', () => {
    const cwd = makeProject();
    const cfg = config({ format: 'systemjs', cwd, argv: argv(), behaviours: systemjsBehaviours });
    assert.equal(cfg.output.filename, 'viz.systemjs.js');
    assert.deepEqual(cfg.output.library, { type: 'system' });

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
    assert.equal(cfg.output.path, path.join(core, 'esm'));
    assert.equal(cfg.output.filename, 'core.js');
  });

  it('puts a banner from package.json on the entry', () => {
    const cwd = makeProject();
    const cfg = config({ format: 'umd', cwd, argv: argv() });
    const banner = cfg.plugins.find((p) => p.name === 'BannerPlugin');
    assert.ok(banner, 'has a banner plugin');
    assert.match(JSON.stringify(banner._args), /@acme\/viz v1\.0\.0[\s\S]*Acme <a@acme\.test>[\s\S]*MIT license/);
  });

  it('minifies in production only, and sets the matching NODE_ENV', () => {
    const cwd = makeProject();
    const prod = config({ mode: 'production', format: 'umd', cwd, argv: argv() });
    const dev = config({ mode: 'development', format: 'umd', cwd, argv: argv() });
    assert.equal(prod.optimization.minimize, true);
    assert.equal(dev.optimization.minimize, false);
    const define = (cfg) => cfg.plugins.find((p) => p.name === 'DefinePlugin')._args[0];
    assert.equal(define(prod)['process.env.NODE_ENV'], '"production"');
    assert.equal(define(dev)['process.env.NODE_ENV'], '"development"');
  });

  it('passes replacementStrings to the bundle and rejects anything that is not an object', () => {
    const cwd = makeProject();
    const cfg = config({
      format: 'umd',
      cwd,
      argv: argv({ replacementStrings: { __VERSION__: JSON.stringify('1.0.0') } }),
    });
    assert.equal(cfg.plugins.find((p) => p.name === 'DefinePlugin')._args[0].__VERSION__, '"1.0.0"');
    assert.throws(
      () => config({ format: 'umd', cwd, argv: argv({ replacementStrings: 'nope' }) }),
      /replacementStrings should be an object/
    );
  });

  it('emits source maps only when asked to', () => {
    const cwd = makeProject();
    assert.equal(config({ format: 'umd', cwd, argv: argv({ sourcemap: true }) }).devtool, 'source-map');
    assert.equal(config({ format: 'umd', cwd, argv: argv({ sourcemap: false }) }).devtool, false);
  });

  it('adds the typescript extensions only with the typescript option', () => {
    const cwd = makeProject();
    assert.deepEqual(config({ format: 'umd', cwd, argv: argv() }).resolve.extensions, ['.mjs', '.js', '.jsx', '.json']);
    assert.deepEqual(config({ format: 'umd', cwd, argv: argv({ typescript: true }) }).resolve.extensions, [
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
      JSON.stringify({ name: '@acme/viz-rn', main: 'dist/rn.js', peerDependencies: { '@nebula.js/stardust': '*' } })
    );
    const cfg = config({
      format: 'umd',
      cwd,
      argv: argv({ reactNative: true, reactNativePath: path.join(cwd, 'react-native') }),
    });
    assert.deepEqual(cfg.resolve.extensions.slice(0, 4), ['.native.mjs', '.mjs', '.native.js', '.js']);
    assert.equal(cfg.output.filename, 'rn.js');
  });

  it('builds a single file unless code splitting is asked for', () => {
    const cwd = makeProject();
    const behaviours = { getOutputFile: ({ pkg }) => pkg.module, enabled: () => true };
    const isLimited = (cfg) => cfg.plugins.some((p) => p.name === 'LimitChunkCountPlugin');

    assert.equal(isLimited(config({ format: 'esm', cwd, argv: argv(), behaviours })), true);
    const split = config({ format: 'esm', cwd, argv: argv({ codeSplit: true }), behaviours });
    assert.equal(isLimited(split), false);
    assert.equal(split.output.path, path.join(cwd, 'dist'));
    assert.equal(split.output.chunkLoading, 'import');
    // code splitting does not apply to umd, it is always one file
    assert.equal(isLimited(config({ format: 'umd', cwd, argv: argv({ codeSplit: true }) })), true);
    // inlineDynamic forces one file for the other formats too
    assert.equal(
      isLimited(config({ format: 'esm', cwd, argv: argv({ codeSplit: true, inlineDynamic: true }), behaviours })),
      true
    );
  });

  it('always keeps stardust and the peer dependencies external', () => {
    const cwd = makeProject({ peerDependencies: { react: '*' } });
    const { warn } = console;
    const warnings = [];
    console.warn = (m) => warnings.push(m);
    try {
      const cfg = config({ format: 'umd', cwd, argv: argv() });
      assert.ok(cfg.externals.length > 0);
      assert.match(warnings.join('\n'), /@nebula\.js\/stardust should be specified as a peer dependency/);
    } finally {
      console.warn = warn;
    }
  });
});
