/* eslint-disable import/extensions */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import createExternals, { guessGlobalName } from '../lib/externals.js';

// what rspack hands to an externals function; `resolvable` lists the requests getResolve can find
const run = async (options, request, resolvable = []) => {
  const [fn] = createExternals(options);
  const getResolve = () => (context, req, callback) =>
    resolvable.includes(req) ? callback(null, `/resolved/${req}`) : callback(new Error(`cannot resolve ${req}`));
  return fn({ request, context: '/project', getResolve });
};

describe('createExternals', () => {
  const base = { external: ['@nebula.js/stardust', /^@qlik\/api\//], format: 'esm' };

  it('keeps listed ids out of the bundle, matching strings exactly and regular expressions by test', async () => {
    assert.equal(await run(base, '@nebula.js/stardust'), '@nebula.js/stardust');
    assert.equal(await run(base, '@qlik/api/auth'), '@qlik/api/auth');
    // like rollup, 'react' does not also external 'react/jsx-runtime'
    assert.equal(await run({ ...base, external: ['react'] }, 'react/jsx-runtime', ['react/jsx-runtime']), undefined);
  });

  it('describes umd externals per module system with the stardust global', async () => {
    const globals = { '@nebula.js/stardust': 'stardust' };
    assert.deepEqual(await run({ ...base, format: 'umd', globals }, '@nebula.js/stardust'), {
      root: 'stardust',
      commonjs: '@nebula.js/stardust',
      commonjs2: '@nebula.js/stardust',
      amd: '@nebula.js/stardust',
    });
  });

  it('guesses the global name of an external that has none, the way rollup did', async () => {
    assert.equal(guessGlobalName('react-dom'), 'reactDom');
    assert.equal(guessGlobalName('@scope/some-pkg'), 'somePkg');
    const result = await run({ ...base, format: 'umd', external: ['react-dom'] }, 'react-dom');
    assert.equal(result.root, 'reactDom');
  });

  it('leaves node builtins alone only when preferBuiltins is set', async () => {
    assert.equal(await run({ ...base, preferBuiltins: true }, 'path'), 'path');
    assert.equal(await run({ ...base, preferBuiltins: true }, 'node:fs'), 'node:fs');
    // not preferred: the import goes through normal resolution, which here finds it
    assert.equal(await run({ ...base, preferBuiltins: false }, 'path', ['path']), undefined);
  });

  it('keeps a require() of a node builtin a call that is made when it is reached, not a dependency of the bundle', async () => {
    const options = { ...base, preferBuiltins: true };
    const [fn] = createExternals({ ...options, format: 'umd' });
    const [sys] = createExternals({ ...options, format: 'systemjs' });
    const [esm] = createExternals({ ...options, format: 'esm' });
    const data = { request: 'crypto', context: '/p', getResolve: () => () => {} };

    assert.equal(await fn({ ...data, dependencyType: 'commonjs' }), 'node-commonjs crypto');
    assert.equal(await sys({ ...data, dependencyType: 'commonjs' }), 'node-commonjs crypto');
    // an esm bundle has no free require, the module resolves to an empty one
    assert.equal(await esm({ ...data, dependencyType: 'commonjs' }), undefined);
    // an import is still a dependency of the bundle
    assert.equal(await sys({ ...data, dependencyType: 'esm' }), 'crypto');
  });

  it('treats an unresolvable package as an external and warns once', async () => {
    const warnings = [];
    const options = { ...base, warn: (m) => warnings.push(m) };
    const [fn] = createExternals(options);
    const getResolve = () => (context, req, callback) => callback(new Error('nope'));
    assert.equal(await fn({ request: 'qlik', context: '/p', getResolve }), 'qlik');
    assert.equal(await fn({ request: 'qlik', context: '/p', getResolve }), 'qlik');
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /qlik/);
  });

  it('does not touch requests that are not package requests', async () => {
    const warnings = [];
    const options = { ...base, warn: (m) => warnings.push(m) };
    const requests = [
      './local',
      '../up',
      '/abs/path',
      // what a loader adds to the request of the stylesheet it injects
      '!!../../node_modules/css-loader/dist/cjs.js!./a.css',
      '-!./x.js',
    ];
    const results = await Promise.all(requests.map((request) => run(options, request)));
    assert.deepEqual(
      results,
      requests.map(() => undefined)
    );
    assert.deepEqual(warnings, []);
  });

  it('lets a package that resolves be bundled', async () => {
    assert.equal(await run(base, 'lodash-es', ['lodash-es']), undefined);
  });
});
