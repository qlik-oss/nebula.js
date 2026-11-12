import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import express from 'express';

import { initiateWatch, getSystemFileName, getEsmFileName } from '../lib/serve.js';

describe('/pkg/:name', () => {
  let dir;
  let watch;
  let server;
  let base;

  const get = (name) => fetch(`${base}/pkg/${name}`);

  before(async () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'serve-route-'));
    const dist = path.join(dir, 'dist');
    fs.mkdirSync(dist);
    fs.writeFileSync(path.join(dist, 'entry.js'), 'import("./chunk-a.js");');
    fs.writeFileSync(path.join(dist, 'chunk-a.js'), 'export default "chunk";');
    fs.writeFileSync(path.join(dist, 'chunk-a.js.map'), '{"version":3}');
    fs.writeFileSync(path.join(dir, 'secret.js'), 'export default "secret";');

    watch = await initiateWatch({ snPath: path.join(dist, 'entry.js'), snName: 'sn-viz', host: 'localhost' });
    const app = express();
    watch.addRoutes(app, { headers: {} });
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

  it('should serve the entry', async () => {
    const res = await get('sn-viz');
    assert.equal(res.status, 200);
    assert.equal(await res.text(), 'import("./chunk-a.js");');
  });

  it('should serve a chunk beside the entry as javascript', async () => {
    const res = await get('chunk-a.js');
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /javascript/);
    assert.equal(await res.text(), 'export default "chunk";');
  });

  it('should serve the source map of a chunk', async () => {
    const res = await get('chunk-a.js.map');
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /json/);
  });

  ['..', '%2e%2e', '%2e%2e%2fsecret.js', '..%2Fsecret.js', '..%5Csecret.js', 'sub%2F..%2Fchunk-a.js'].forEach(
    (name) => {
      it(`should not serve ${name}`, async () => {
        const res = await get(name);
        assert.notEqual(res.status, 200);
        assert.doesNotMatch(await res.text(), /export default/);
      });
    }
  );

  it('should fall through to module resolution for an unknown name', async () => {
    // not beside the entry, so it is resolved as a module, which does not exist
    const res = await get('no-such-chunk.js');
    assert.equal(res.status, 500);
  });
});

describe('/<name>.js', () => {
  let dir;
  let watch;
  let server;
  let base;

  const get = (name) => fetch(`${base}/${name}`);

  before(async () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'serve-system-route-'));
    const dist = path.join(dir, 'dist');
    fs.mkdirSync(dist);
    fs.writeFileSync(path.join(dist, 'sn-viz.js'), 'export default "esm";');
    fs.writeFileSync(path.join(dist, 'sn-viz.systemjs.js'), 'System.register([]);');
    fs.writeFileSync(path.join(dist, 'sn-viz.systemjs.chunk-a.js'), 'System.register(["chunk"]);');
    fs.writeFileSync(path.join(dist, 'sn-viz.systemjs.chunk-a.js.map'), '{"version":3}');
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

  it('should name the file after the package without the @ and the /', () => {
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

  it('should serve a chunk and its source map beside the systemjs module', async () => {
    assert.equal(await (await get('sn-viz.systemjs.chunk-a.js')).text(), 'System.register(["chunk"]);');
    const map = await get('sn-viz.systemjs.chunk-a.js.map');
    assert.match(map.headers.get('content-type'), /json/);
  });

  it('should leave other paths to the web app', async () => {
    assert.equal((await get('index.html')).status, 418);
    assert.equal((await get('unknown.js')).status, 418);
    assert.equal((await get('..%2Fsecret.js')).status, 418);
  });
});
