import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import express from 'express';

import { initiateWatch } from '../lib/serve.js';

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
