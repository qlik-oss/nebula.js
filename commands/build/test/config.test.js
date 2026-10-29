/* eslint-disable import/extensions, no-console, no-underscore-dangle */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import config from '../lib/config.js';
import systemjsBehaviours from '../lib/systemjs.js';

const makeProject = (pkg = {}, files = {}) => {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nebula-build-config-')));
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
const esmBehaviours = { getOutputFile: ({ pkg }) => pkg.module, enabled: ({ pkg }) => !!pkg.module };
const pluginNames = (cfg) => cfg.output.plugins.map((p) => p.name);

describe('build config', () => {
  it('writes the umd bundle to package.json main, named after the package', () => {
    const cwd = makeProject();
    const { input, output } = config({ format: 'umd', cwd, argv: argv() });
    assert.equal(input.input, path.join(cwd, 'src/index'));
    assert.equal(output.format, 'umd');
    assert.equal(output.file, path.join(cwd, 'dist/viz.js'));
    assert.equal(output.name, 'viz');
    assert.equal(output.codeSplitting, false);
  });

  it('is strict inside the wrapper of the umd bundle, which Rollup did and Rolldown does not', () => {
    const cwd = makeProject();
    assert.equal(config({ format: 'umd', cwd, argv: argv() }).output.intro, '"use strict";');
    assert.equal(config({ format: 'esm', cwd, argv: argv(), behaviours: esmBehaviours }).output.intro, undefined);
  });

  it('writes an esm bundle to package.json module and skips it when there is none', () => {
    const cwd = makeProject();
    const { output } = config({ format: 'esm', cwd, argv: argv(), behaviours: esmBehaviours });
    assert.equal(output.format, 'es');
    assert.equal(output.file, path.join(cwd, 'dist/viz.esm.js'));
    assert.equal(
      config({ format: 'esm', cwd: makeProject({ module: undefined }), argv: argv(), behaviours: esmBehaviours }),
      false
    );
  });

  it('converts the es bundle to systemjs and writes it to package.json systemjs, without a name', () => {
    const cwd = makeProject();
    const { output } = config({ format: 'systemjs', cwd, argv: argv(), behaviours: systemjsBehaviours });
    assert.equal(output.format, 'es');
    assert.equal(output.file, path.join(cwd, 'dist/viz.systemjs.js'));
    assert.equal(output.name, undefined);
    assert.ok(pluginNames({ output }).includes('esm-to-systemjs'));
    assert.equal(
      config({
        format: 'systemjs',
        cwd: makeProject({ systemjs: undefined }),
        argv: argv(),
        behaviours: systemjsBehaviours,
      }),
      false
    );
  });

  it('builds into the core package when asked to', () => {
    const cwd = makeProject();
    const core = path.join(cwd, 'core');
    fs.mkdirSync(core);
    fs.writeFileSync(
      path.join(core, 'package.json'),
      JSON.stringify({
        name: '@acme/core',
        version: '1.0.0',
        module: 'esm/core.js',
        peerDependencies: { '@nebula.js/stardust': '*' },
      })
    );
    const { output, input } = config({ format: 'esm', cwd, argv: argv(), core, behaviours: esmBehaviours });
    assert.equal(output.file, path.join(core, 'esm/core.js'));
    // the externals of a core build include @qlik/api
    assert.equal(input.external('@qlik/api/auth'), true);
    assert.equal(input.external('some-lib'), false);
  });

  it('puts a banner from package.json on every format, in production by the minifier', () => {
    const cwd = makeProject();
    const banner =
      /^\/\*\n\* @acme\/viz v1\.0\.0\n\* Copyright \(c\) \d{4} Acme <a@acme\.test>\n\* Released under the MIT license\.\n\*\/\n$/;
    // the author as an object
    const author = makeProject({ author: { name: 'Acme', email: 'a@acme.test' } });
    assert.ok(config({ format: 'umd', cwd: author, argv: argv({ mode: 'x' }), mode: 'development' }).output.postBanner);

    const development = config({ format: 'umd', cwd, argv: argv(), mode: 'development' });
    assert.match(development.output.postBanner, banner);
    assert.deepEqual(pluginNames(development), []);

    const production = config({ format: 'umd', cwd, argv: argv() });
    assert.equal(production.output.postBanner, '');
    assert.deepEqual(pluginNames(production), ['nebula-minify']);
  });

  it('minifies in production only, and sets the matching NODE_ENV', () => {
    const cwd = makeProject();
    const production = config({ format: 'umd', cwd, argv: argv() });
    const development = config({ format: 'umd', cwd, argv: argv(), mode: 'development' });
    assert.equal(production.input.transform.define['process.env.NODE_ENV'], '"production"');
    assert.equal(development.input.transform.define['process.env.NODE_ENV'], '"development"');
    assert.deepEqual(pluginNames(development), []);
    assert.ok(!production.output.minify, 'it is not the minifier of Rolldown');
    assert.deepEqual(production.input.transform.jsx, { runtime: 'automatic', development: false });
    assert.deepEqual(development.input.transform.jsx, { runtime: 'automatic', development: true });
    // development builds have a visualization of the bundle
    assert.ok(development.input.plugins.some((p) => p.name === 'visualizer'));
    assert.ok(!production.input.plugins.some((p) => p.name === 'visualizer'));
  });

  it('passes replacementStrings to the bundle and rejects anything that is not an object', () => {
    const cwd = makeProject();
    const { input } = config({
      format: 'umd',
      cwd,
      argv: argv({ replacementStrings: { 'process.env.VERSION': '"1.2.3"', __COUNT__: 3 } }),
    });
    assert.equal(input.transform.define['process.env.VERSION'], '"1.2.3"');
    assert.equal(input.transform.define.__COUNT__, '3');
    assert.throws(
      () => config({ format: 'umd', cwd, argv: argv({ replacementStrings: 'nope' }) }),
      /replacementStrings should be an object/
    );
  });

  it('emits source maps only when asked to', () => {
    const cwd = makeProject();
    assert.equal(config({ format: 'umd', cwd, argv: argv() }).output.sourcemap, true);
    assert.equal(config({ format: 'umd', cwd, argv: argv({ sourcemap: false }) }).output.sourcemap, false);
  });

  it('adds the typescript extensions only with the typescript option', () => {
    const cwd = makeProject();
    const extensions = (options) => config({ format: 'umd', cwd, argv: argv(options) }).input.resolve.extensions;
    assert.ok(!extensions({}).includes('.ts'));
    assert.deepEqual(extensions({ typescript: true }).slice(-2), ['.tsx', '.ts']);
  });

  it('transforms to the oldest browsers of the browserslist, and reads no configuration of Babel or TypeScript', () => {
    const { input } = config({ format: 'umd', cwd: makeProject(), argv: argv() });
    assert.ok(input.transform.target.length >= 3);
    input.transform.target.forEach((target) => assert.match(target, /^(chrome|edge|firefox|safari|ios)\d+/));
    assert.equal(input.tsconfig, undefined);
    assert.equal(input.transform.typescript.onlyRemoveTypeImports, true);
  });

  it('resolves the way the browser field says in a browser build, with the module and main fields otherwise', () => {
    const cwd = makeProject();
    const resolved = (browser) => config({ format: 'umd', cwd, argv: argv({ browser }) }).input;
    assert.equal(resolved(true).platform, 'browser');
    assert.deepEqual(resolved(true).resolve.mainFields, ['browser', 'module', 'main']);
    assert.equal(resolved(false).platform, 'neutral');
    assert.deepEqual(resolved(false).resolve.mainFields, ['module', 'main']);
  });

  it('leaves out the property writes that nothing uses, the way Rollup did', () => {
    assert.equal(
      config({ format: 'umd', cwd: makeProject(), argv: argv() }).input.treeshake.propertyWriteSideEffects,
      false
    );
  });

  it('prefers .native files for react native builds', () => {
    const cwd = makeProject();
    fs.mkdirSync(path.join(cwd, 'react-native'));
    fs.writeFileSync(
      path.join(cwd, 'react-native', 'package.json'),
      JSON.stringify({ name: '@acme/viz-rn', main: 'dist/rn.js', peerDependencies: { '@nebula.js/stardust': '*' } })
    );
    const original = process.cwd();
    process.chdir(cwd);
    let cfg;
    try {
      cfg = config({ format: 'umd', cwd, argv: argv({ reactNative: true, reactNativePath: './react-native' }) });
    } finally {
      process.chdir(original);
    }
    assert.equal(cfg.input.plugins[0].name, undefined);
    assert.equal(typeof cfg.input.plugins[0].load, 'function');
    assert.equal(cfg.output.file, path.join(cwd, 'react-native/dist/rn.js'));
  });

  it('builds a single file unless code splitting is asked for', () => {
    const cwd = makeProject();
    const esm = (extra) => config({ format: 'esm', cwd, argv: argv(extra), behaviours: esmBehaviours }).output;

    assert.equal(esm({}).file, path.join(cwd, 'dist/viz.esm.js'));
    assert.equal(esm({}).codeSplitting, undefined);
    const split = esm({ codeSplit: true });
    assert.equal(split.file, undefined);
    assert.equal(split.dir, path.join(cwd, 'dist'));
    // code splitting does not apply to umd, it is always one file
    assert.equal(
      config({ format: 'umd', cwd, argv: argv({ codeSplit: true }) }).output.file,
      path.join(cwd, 'dist/viz.js')
    );
    // inlineDynamic keeps the chunks in one, in a directory with codeSplit
    const inlined = esm({ codeSplit: true, inlineDynamic: true });
    assert.equal(inlined.dir, path.join(cwd, 'dist'));
    assert.equal(inlined.codeSplitting, false);
    assert.equal(esm({ inlineDynamic: true }).codeSplitting, false);
  });

  it('names the globals of externals in umd bundles', () => {
    const { output } = config({ format: 'umd', cwd: makeProject(), argv: argv() });
    assert.equal(output.globals('@nebula.js/stardust'), 'stardust');
    assert.equal(output.globals('react'), 'React');
    assert.equal(output.globals('react-dom'), 'ReactDOM');
    // as Rollup guessed them
    assert.equal(output.globals('some-peer'), 'somePeer');
    assert.equal(output.globals('@scope/other-lib'), 'otherLib');
    assert.equal(output.globals('lib/sub-path.js'), 'subPath');
  });

  it('always keeps stardust and the peer dependencies external, matching strings exactly and expressions by test', () => {
    const cwd = makeProject({ peerDependencies: { react: '*' } });
    const { warn } = console;
    const warnings = [];
    console.warn = (m) => warnings.push(m);
    try {
      const { input } = config({ format: 'umd', cwd, argv: argv() });
      assert.equal(input.external('react'), true);
      assert.equal(input.external('react/jsx-runtime'), false);
      assert.equal(input.external('@nebula.js/stardust'), true);
      assert.match(warnings.join('\n'), /@nebula\.js\/stardust should be specified as a peer dependency/);

      const custom = config({
        format: 'umd',
        cwd,
        argv: argv(),
        behaviours: { getExternal: () => ['a', /^b\//, '@nebula.js/stardust'] },
      });
      assert.deepEqual(['a', 'b/c', 'ab', 'c'].map(custom.input.external), [true, true, false, false]);
    } finally {
      console.warn = warn;
    }
  });

  it('uses the externals of the systemjs config of the project when it has them', () => {
    const cwd = makeProject();
    const external = (systemjs) =>
      config({ format: 'systemjs', cwd, argv: argv({ systemjs }), behaviours: systemjsBehaviours }).input.external;
    assert.equal(external({})('react-dom'), true);
    assert.equal(external({ external: ['only-this', '@nebula.js/stardust'] })('react-dom'), false);
    assert.equal(external({ external: ['only-this', '@nebula.js/stardust'] })('only-this'), true);
  });
});
