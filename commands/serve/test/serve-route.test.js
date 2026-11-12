import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import express from 'express';

import { initiateWatch, getModuleUrl } from '../lib/serve.js';

describe('getModuleUrl', () => {
  it('is the file name', () => {
    assert.equal(getModuleUrl('/pkg/dist/sn-viz.systemjs.js'), '/sn-viz.systemjs.js');
  });
});

describe('the files of the build', () => {
  let dir;
  let watch;
  let server;
  let base;

  const get = (name) => fetch(`${base}/${name}`);

  before(async () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'serve-route-'));
    fs.mkdirSync(path.join(dir, 'esm'));
    fs.mkdirSync(path.join(dir, 'dist'));
    fs.mkdirSync(path.join(dir, 'src'));
    fs.writeFileSync(path.join(dir, 'esm/sn-viz.js'), 'export default "esm";');
    fs.writeFileSync(path.join(dir, 'esm/sn-viz.chunk-a.js'), 'export default "chunk";');
    fs.writeFileSync(path.join(dir, 'dist/sn-viz.systemjs.js'), 'System.register([]);');
    fs.writeFileSync(path.join(dir, 'dist/sn-viz.systemjs.js.map'), '{"version":3}');
    fs.writeFileSync(path.join(dir, 'dist/sn-viz.systemjs.chunk-a.js'), 'System.register(["chunk"]);');
    fs.writeFileSync(path.join(dir, 'src/index.js'), 'export default "source";');
    fs.writeFileSync(path.join(dir, 'package.json'), '{"name":"secret"}');

    watch = await initiateWatch({
      snPath: path.join(dir, 'esm/sn-viz.js'),
      systemPath: path.join(dir, 'dist/sn-viz.systemjs.js'),
      snName: 'sn-viz',
      host: 'localhost',
    });
    const app = express();
    watch.addRoutes(app, { headers: { 'X-Test': 'yes' } });
    app.use((req, res) => res.status(418).send('web app'));
    await new Promise((resolve) => {
      server = app.listen(0, 'localhost', resolve);
    });
    base = `http://localhost:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve) => {
      server.close(resolve);
    });
    await watch.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('should serve the es module by its file name', async () => {
    const res = await get('sn-viz.js');
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /javascript/);
    assert.equal(res.headers.get('x-test'), 'yes');
    assert.equal(await res.text(), 'export default "esm";');
  });

  it('should serve the systemjs module by its file name', async () => {
    const res = await get('sn-viz.systemjs.js');
    assert.equal(res.status, 200);
    assert.equal(await res.text(), 'System.register([]);');
  });

  it('should serve the source map of a module', async () => {
    assert.match((await get('sn-viz.systemjs.js.map')).headers.get('content-type'), /json/);
  });

  it('should serve the chunks beside the modules', async () => {
    assert.equal(await (await get('sn-viz.chunk-a.js')).text(), 'export default "chunk";');
    assert.equal(await (await get('sn-viz.systemjs.chunk-a.js')).text(), 'System.register(["chunk"]);');
  });

  it('should not serve the directories of the build by their names', async () => {
    assert.equal((await get('dist/sn-viz.systemjs.js')).status, 418);
    assert.equal((await get('esm/sn-viz.js')).status, 418);
    assert.equal((await get('missing.js')).status, 418);
    assert.equal((await get('..%2Fpackage.json')).status, 418);
  });

  it('should leave everything else to the web app', async () => {
    assert.equal((await get('index.html')).status, 418);
    assert.equal((await get('src/index.js')).status, 418);
    assert.equal((await get('package.json')).status, 418);
  });
});
