import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {
  createPlan,
  createSnapshooterPlan,
  getBanner,
  getUmdName,
  validateDependencies,
  validatePackage,
} from '../plan.mjs';

const cwd = '/repo/apis/stardust';
const stardust = {
  name: '@nebula.js/stardust',
  version: '1.2.3',
  main: 'index.js',
  unpkg: 'dist/stardust.js',
  jsdelivr: 'dist/stardust.js',
};
const files = (plan) =>
  plan.flatMap((b) => b.outputs.map((o) => path.relative(cwd, o.file || path.join(o.dir, o.entryFileName))));

describe('createPlan', () => {
  test('stardust builds umd, systemjs and the core esm bundles, in a production and a dev variant', () => {
    const plan = createPlan({
      cwd,
      pkg: stardust,
      corePkg: { module: 'esm/index.js', peerDependencies: { react: '*' } },
    });
    assert.deepEqual(files(plan).sort(), [
      'core/esm/dev.js',
      'core/esm/index.js',
      'dist/stardust.dev.js',
      'dist/stardust.js',
      'dist/stardust.systemjs.dev.js',
      'dist/stardust.systemjs.js',
    ]);
  });

  test('exports of stardust and test-utils are named, the others default', () => {
    const formats = (pkg) =>
      createPlan({ cwd, pkg: { ...pkg, main: 'index.js' } }).flatMap((b) => b.outputs.map((o) => o.exports));
    assert.deepEqual([...new Set(formats({ name: '@nebula.js/stardust', version: '1.0.0' }))], ['named']);
    assert.deepEqual([...new Set(formats({ name: '@nebula.js/test-utils', version: '1.0.0' }))], ['named']);
    assert.deepEqual([...new Set(formats({ name: '@nebula.js/other', version: '1.0.0' }))], ['default']);
  });

  test('test-utils only builds one umd bundle, also when watching', () => {
    const pkg = { name: '@nebula.js/test-utils', version: '1.0.0', main: 'index.js' };
    [false, true].forEach((watch) => {
      const plan = createPlan({ cwd, pkg, watch });
      assert.equal(plan.length, 1);
      assert.deepEqual(
        plan[0].outputs.map((o) => [o.format, o.name, o.globals]),
        [['umd', 'testUtils', {}]]
      );
    });
  });

  test('a package with a module target also builds esm', () => {
    const pkg = { name: '@nebula.js/other', version: '1.0.0', main: 'index.js', module: 'dist/other.esm' };
    assert.deepEqual(files(createPlan({ cwd, pkg })).sort(), [
      'dist/other.dev.js',
      'dist/other.esm.dev.js',
      'dist/other.esm.js',
      'dist/other.js',
    ]);
  });

  test('umd outputs are left out when watching', () => {
    const plan = createPlan({ cwd, pkg: stardust, corePkg: { module: 'esm/index.js' }, watch: true });
    assert.ok(files(plan).every((f) => !/stardust(\.dev)?\.js$/.test(f) || f.startsWith('core')));
    assert.ok(files(plan).includes('dist/stardust.systemjs.js'));
  });

  test('dev variants are not minified and use the dev flag', () => {
    const plan = createPlan({ cwd, pkg: stardust });
    plan.forEach((b) => {
      assert.equal(b.minify, !b.debug);
      assert.equal(b.inlineDynamicImports, !/systemjs/.test(b.label));
    });
  });

  test('peer dependencies are external, and globals are given for the ones we know', () => {
    const pkg = {
      ...stardust,
      peerDependencies: { react: '*', 'react-dom': '*', '@nebula.js/stardust': '*', other: '*' },
    };
    const [prod] = createPlan({ cwd, pkg });
    assert.deepEqual(prod.external, ['react', 'react-dom', '@nebula.js/stardust', 'other']);
    assert.deepEqual(prod.outputs[0].globals, {
      react: 'React',
      'react-dom': 'ReactDOM',
      '@nebula.js/stardust': 'stardust',
    });
  });
});

describe('validation', () => {
  test('main must be index.js', () => {
    assert.throws(() => validatePackage({ ...stardust, main: 'lib/index.js' }), /main target must be index.js/);
  });

  test('module, unpkg and jsdelivr must match the names of the outputs', () => {
    assert.doesNotThrow(() => validatePackage({ ...stardust, module: 'dist/stardust.esm' }));
    assert.throws(
      () => validatePackage({ ...stardust, module: 'dist/stardust.esm.js' }),
      /module target must be dist\/stardust.esm/
    );
    assert.throws(() => validatePackage({ ...stardust, unpkg: 'dist/x.js' }), /unpkg target must be dist\/stardust.js/);
    assert.throws(
      () => validatePackage({ ...stardust, jsdelivr: 'dist/x.js' }),
      /jsdelivr target must be dist\/stardust.js/
    );
  });

  test('dependencies are only allowed for @qlik/api', () => {
    assert.doesNotThrow(() =>
      validateDependencies({ ...stardust, dependencies: { '@qlik/api': '1.0.0', '@qlik/api-extra': '1' } })
    );
    assert.throws(
      () => validateDependencies({ ...stardust, dependencies: { '@qlik/api': '1.0.0', lodash: '4' } }),
      /lodash/
    );
    assert.throws(() => createPlan({ cwd, pkg: { ...stardust, dependencies: { lodash: '4' } } }), /makes no sense/);
  });
});

describe('helpers', () => {
  test('umd names', () => {
    assert.equal(getUmdName('stardust'), 'stardust');
    assert.equal(getUmdName('test-utils'), 'testUtils');
  });

  test('banner', () => {
    assert.equal(
      getBanner({ name: '@nebula.js/stardust', version: '1.2.3', license: 'MIT' }, 2030),
      '/*\n* @nebula.js/stardust v1.2.3\n* Copyright (c) 2030 QlikTech International AB\n* Released under the MIT license.\n*/\n'
    );
  });

  test('the snapshooter client is minified in production only, and has no source map', () => {
    const [prod] = createSnapshooterPlan({ cwd: '/repo/apis/snapshooter', production: true });
    const [dev] = createSnapshooterPlan({ cwd: '/repo/apis/snapshooter', production: false });
    assert.equal(prod.minify, true);
    assert.equal(dev.minify, false);
    assert.equal(prod.sourcemap, false);
    assert.deepEqual(
      prod.outputs.map((o) => [o.format, o.name, o.exports, o.file]),
      [['umd', 'snapshooter', 'default', '/repo/apis/snapshooter/client.js']]
    );
  });
});
