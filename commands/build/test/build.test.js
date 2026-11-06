import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import build from '../lib/build.js';

let root;
let dir;
let counter = 0;

const write = (name, content) => {
  const file = path.join(dir, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

const pkg = (fields = {}) =>
  write(
    'package.json',
    JSON.stringify({
      name: '@acme/viz',
      version: '1.0.0',
      peerDependencies: { '@nebula.js/stardust': '*' },
      ...fields,
    })
  );

const files = () => fs.readdirSync(path.join(dir, 'dist')).sort();

describe('nebula build', () => {
  before(() => {
    root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nebula-build-')));
  });

  after(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  beforeEach(() => {
    counter += 1;
    dir = path.join(root, `project-${counter}`);
    write(
      'src/index.js',
      "import { useElement } from '@nebula.js/stardust';\nexport default () => ({ useElement });\n"
    );
  });

  const run = (options = {}) => build({ cwd: dir, sourcemap: false, ...options });

  it('writes the es module, and no UMD bundle', async () => {
    pkg({ main: 'dist/viz.js', module: 'dist/viz.esm.js' });
    await run();
    assert.deepEqual(files(), ['viz.esm.js']);
  });

  it('writes the SystemJS module of the systemjs field with systemjs', async () => {
    pkg({ module: 'dist/viz.esm.js', systemjs: 'dist/viz.systemjs.js' });
    await run({ systemjs: true });
    assert.deepEqual(files(), ['viz.esm.js', 'viz.systemjs.js']);
  });

  it('builds only the SystemJS module when there is no module field', async () => {
    pkg({ systemjs: 'dist/viz.systemjs.js' });
    await run({ systemjs: true });
    assert.deepEqual(files(), ['viz.systemjs.js']);
  });

  it('is an error when there is nothing to build, a main field is not built', async () => {
    pkg({ main: 'dist/viz.js' });
    await assert.rejects(run(), /Nothing to build/);
    assert.equal(fs.existsSync(path.join(dir, 'dist')), false);
  });

  it('does not watch umd', async () => {
    pkg({ module: 'dist/viz.esm.js' });
    await assert.rejects(run({ watch: 'umd' }), /Cannot watch 'umd'/);
  });
});
