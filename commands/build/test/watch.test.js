/* eslint-disable import/extensions, no-console */
import { describe, it, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import build from '../lib/build.js';

// `nebula serve` builds the visualization with `build({ watch })` and relies on what the watcher does:
// it resolves after the first build, it emits events shaped like rollup's, and it can be closed.

const originalLog = console.log;
const originalError = console.error;

let root;
let dir;
let watcher;
let events;
let counter = 0;

const write = (name, content) => {
  const file = path.join(dir, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

const source = (value) => `export default function supernova() { return { value: ${JSON.stringify(value)} }; }\n`;

const waitFor = (predicate, what, timeout = 20000) =>
  new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      const found = predicate();
      if (found) {
        resolve(found);
      } else if (Date.now() - started > timeout) {
        reject(new Error(`timed out waiting for ${what}; events so far: ${events.map((e) => e.code).join(', ')}`));
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });

const startWatch = async (options = {}) => {
  events = [];
  const promise = build({ cwd: dir, watch: 'umd', ...options });
  return promise;
};

describe('nebula build --watch', () => {
  before(() => {
    root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nebula-watch-')));
    console.log = () => {};
    console.error = () => {};
  });

  after(() => {
    console.log = originalLog;
    console.error = originalError;
    fs.rmSync(root, { recursive: true, force: true });
  });

  beforeEach(() => {
    counter += 1;
    dir = path.join(root, `project-${counter}`);
    write(
      'package.json',
      JSON.stringify({
        name: '@acme/viz',
        version: '1.0.0',
        license: 'MIT',
        main: 'dist/viz.js',
        systemjs: 'dist/viz.systemjs.js',
        peerDependencies: { '@nebula.js/stardust': '*' },
      })
    );
    write('src/index.js', source('first'));
    watcher = undefined;
  });

  afterEach(async () => {
    if (watcher) {
      await watcher.close();
    }
  });

  const output = () => fs.readFileSync(path.join(dir, 'dist/viz.js'), 'utf8');

  it('resolves with a watcher once the first build is written', async () => {
    watcher = await startWatch();
    assert.equal(typeof watcher.on, 'function');
    assert.equal(typeof watcher.close, 'function');
    assert.match(output(), /first/);
  });

  it('builds a development bundle by default', async () => {
    watcher = await startWatch();
    // not minified: the source's own function name is still there
    assert.match(output(), /function supernova/);
  });

  it('emits BUNDLE_START and BUNDLE_END and rebuilds when a source file changes', async () => {
    watcher = await startWatch();
    watcher.on('event', (event) => events.push(event));

    write('src/index.js', source('second'));

    const end = await waitFor(() => events.find((e) => e.code === 'BUNDLE_END'), 'BUNDLE_END after an edit');
    assert.equal(typeof end.duration, 'number');
    assert.ok(events.findIndex((e) => e.code === 'BUNDLE_START') < events.findIndex((e) => e.code === 'BUNDLE_END'));
    assert.match(output(), /second/);
  });

  it('emits ERROR with the error when the source stops compiling, and recovers when it is fixed', async () => {
    watcher = await startWatch();
    watcher.on('event', (event) => events.push(event));

    write('src/index.js', 'export default function ( {\n');
    const failure = await waitFor(() => events.find((e) => e.code === 'ERROR'), 'ERROR after a syntax error');
    assert.ok(failure.error instanceof Error);
    assert.equal(typeof failure.error.stack, 'string');
    assert.match(failure.error.message, /index\.js/);

    events.length = 0;
    write('src/index.js', source('fixed'));
    await waitFor(() => events.find((e) => e.code === 'BUNDLE_END'), 'BUNDLE_END after the fix');
    assert.match(output(), /fixed/);
  });

  it('rejects when the first build fails', async () => {
    write('src/index.js', 'export default function ( {\n');
    await assert.rejects(startWatch(), (rejection) => {
      // `nebula serve` gets the watcher back, as it did from rollup
      watcher = rejection;
      return typeof rejection.close === 'function';
    });
  });

  it('stops rebuilding after close', async () => {
    watcher = await startWatch();
    watcher.on('event', (event) => events.push(event));
    await watcher.close();
    watcher = undefined;

    write('src/index.js', source('after close'));
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    // the END of the build that was running when the watcher was closed may still come
    assert.deepEqual(
      events.filter(({ code }) => ['BUNDLE_START', 'BUNDLE_END', 'ERROR'].includes(code)),
      []
    );
    assert.doesNotMatch(output(), /after close/);
  });

  it('watches the systemjs bundle when asked to', async () => {
    watcher = await startWatch({ watch: 'systemjs' });
    assert.ok(fs.existsSync(path.join(dir, 'dist/viz.systemjs.js')));
    assert.equal(fs.existsSync(path.join(dir, 'dist/viz.js')), false);
  });

  it('refuses to watch the systemjs bundle without a systemjs field in package.json', async () => {
    write(
      'package.json',
      JSON.stringify({
        name: '@acme/viz',
        version: '1.0.0',
        main: 'dist/viz.js',
        peerDependencies: { '@nebula.js/stardust': '*' },
      })
    );
    assert.equal(await startWatch({ watch: 'systemjs' }), undefined);
  });
});
