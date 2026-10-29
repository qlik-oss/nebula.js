/* eslint-disable import/extensions */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';

import builtins, { isBuiltin, isExternal } from '../lib/externals.js';

const resolve = (plugin, source, resolved) =>
  plugin.resolveId.call({ resolve: async () => resolved }, source, '/src/a.js', {});
const read = (plugin, id) => plugin.load.handler.call({}, id).code;

describe('isExternal', () => {
  it('matches a string exactly and a regular expression by test, like Rollup', () => {
    const external = ['react', /^@qlik\/api\//];
    assert.equal(isExternal(external, 'react'), true);
    assert.equal(isExternal(external, 'react/jsx-runtime'), false);
    assert.equal(isExternal(external, '@qlik/api/auth'), true);
    assert.equal(isExternal(external, '@qlik/apis'), false);
  });
});

describe('node builtins', () => {
  it('knows them with and without the node: prefix', () => {
    assert.equal(isBuiltin('crypto'), true);
    assert.equal(isBuiltin('node:fs'), true);
    assert.equal(isBuiltin('fs/promises'), true);
    assert.equal(isBuiltin('react'), false);
  });

  it('leaves them to the consumer of an esm bundle', async () => {
    const plugin = builtins({ format: 'esm', preferBuiltins: true });
    assert.deepEqual(await resolve(plugin, 'crypto'), { id: 'crypto', external: true });
    assert.equal(await resolve(plugin, 'react'), null);
  });

  ['umd', 'systemjs'].forEach((format) => {
    it(`are not dependencies of a ${format} bundle, they are read where there is a require`, async () => {
      const plugin = builtins({ format, preferBuiltins: true });
      const id = await resolve(plugin, 'crypto');
      assert.equal(typeof id, 'string');
      assert.ok(id.startsWith('\0'), 'a module of the bundle');
      assert.equal(await resolve(plugin, id), id);

      const evaluate = (sandbox) => {
        const module = { exports: {} };
        vm.runInNewContext(read(plugin, id), { module, ...sandbox });
        return module.exports;
      };
      const randomBytes = () => 'bytes';
      assert.deepEqual(evaluate({ require: () => ({ randomBytes }) }), { randomBytes });
      // no require, a require that throws (an amd host that has not got it): an empty module
      assert.deepEqual(JSON.parse(JSON.stringify(evaluate({}))), {});
      assert.deepEqual(
        JSON.parse(
          JSON.stringify(
            evaluate({
              require: () => {
                throw new Error('not loaded');
              },
            })
          )
        ),
        {}
      );
    });
  });

  it('are the package of that name without preferBuiltins, when there is one', async () => {
    const plugin = builtins({ format: 'esm', preferBuiltins: false });
    const found = { id: '/project/node_modules/events/index.js' };
    assert.equal(await resolve(plugin, 'events', found), found);
    assert.deepEqual(await resolve(plugin, 'events', null), { id: 'events', external: true });
    assert.deepEqual(await resolve(plugin, 'fs', { id: 'fs', external: true }), { id: 'fs', external: true });
  });
});
