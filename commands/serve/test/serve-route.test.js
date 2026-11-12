import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import express from 'express';

import { initiateWatch, getSystemFileName, getEsmFileName } from '../lib/serve.js';

describe('the modules of a visualization', () => {
  let dir;
  let watch;
  let server;
  let base;

  const get = (name) => fetch(`${base}/${name}`);

  before(async () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'serve-route-'));
    const dist = path.join(dir, 'dist');
    fs.mkdirSync(path.join(dist, 'chunks'), { recursive: true });
    fs.writeFileSync(path.join(dist, 'sn-viz.js'), 'export default "esm";');
    fs.writeFileSync(path.join(dist, 'sn-viz.systemjs.js'), 'System.register([]);');
    fs.writeFileSync(path.join(dist, 'chunks', 'sn-viz.systemjs.chunk-a.js'), 'System.register(["chunk"]);');
    fs.writeFileSync(path.join(dist, 'chunks', 'sn-viz.systemjs.chunk-a.js.map'), '{"version":3}');
    fs.writeFileSync(path.join(dist, 'unrelated.js'), 'export default "unrelated";');
    fs.writeFileSync(path.join(dir, 'secret.js'), 'export default "secret";');

    watch = await initiateWatch({
      snPath: path.join(dist, 'sn-viz.js'),
      systemPath: path.join(dist, 'sn-viz.systemjs.js'),
      snName: '@scope/sn-viz',
      host: 'localhost',
    });
    const app = express();
    watch.addRoutes(app, { headers: {} });
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

  it('should name the files after the package without the @ and the /', () => {
    assert.equal(getSystemFileName('@scope/sn-viz'), 'scope-sn-viz.js');
    assert.equal(getSystemFileName('sn-viz'), 'sn-viz.js');
    assert.equal(getEsmFileName('@scope/sn-viz'), 'scope-sn-viz.esm.js');
  });

  it('should serve the es module', async () => {
    const res = await get('scope-sn-viz.esm.js');
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /javascript/);
    assert.equal(await res.text(), 'export default "esm";');
  });

  it('should serve the systemjs module, not the es module', async () => {
    const res = await get('scope-sn-viz.js');
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /javascript/);
    assert.equal(await res.text(), 'System.register([]);');
  });

  it('should serve a chunk and its source map from chunks', async () => {
    const chunk = await get('chunks/sn-viz.systemjs.chunk-a.js');
    assert.equal(chunk.status, 200);
    assert.match(chunk.headers.get('content-type'), /javascript/);
    assert.equal(await chunk.text(), 'System.register(["chunk"]);');
    const map = await get('chunks/sn-viz.systemjs.chunk-a.js.map');
    assert.match(map.headers.get('content-type'), /json/);
  });

  it('should leave everything else to the web app', async () => {
    assert.equal((await get('index.html')).status, 418);
    assert.equal((await get('unrelated.js')).status, 418);
    assert.equal((await get('chunks/missing.js')).status, 418);
    assert.equal((await get('chunks/..%2Fsecret.js')).status, 418);
    assert.equal((await get('pkg/scope-sn-viz')).status, 418);
  });
});
