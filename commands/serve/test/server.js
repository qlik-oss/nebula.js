/**
 * Test server: starts the serve webpack dev server in production mode
 * (serves the pre-built dist/ bundle) with a mock engine config.
 * No webpack compilation needed — starts quickly.
 */
import webpackServe from '../lib/webpack.serve.js';

const PORT = process.env.SERVE_TEST_PORT ? Number(process.env.SERVE_TEST_PORT) : 8700;
const ENGINE_HOST = 'localhost';
const ENGINE_PORT = 9076;

await webpackServe({
  host: 'localhost',
  port: PORT,
  enigmaConfig: {
    host: ENGINE_HOST,
    port: ENGINE_PORT,
    secure: false,
    appId: 'test-app-id',
  },
  snName: 'sn-serve-test',
  snUrl: null,
  dev: false,
  open: false,
  entryWatcher: null,
  watcher: null,
  serveConfig: {
    themes: [],
    types: [],
    flags: {},
    anything: {},
    snapshots: [],
    renderConfigs: [],
    keyboardNavigation: false,
    resources: null,
    mfe: false,
    https: false,
    // Required by webpack.prod.js for the fixtures webpack alias
    fixturePath: 'test/component',
    scripts: [],
    stylesheets: [],
  },
});

// eslint-disable-next-line no-console
console.log(`Serve test server ready at http://localhost:${PORT}`);
