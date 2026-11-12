/**
 * Test server: starts the serve dev server in production mode
 * (serves the pre-built dist/ bundle) with a mock engine config.
 * No compilation of the pages is needed — starts quickly.
 */
import rsbuildServe from '../lib/rsbuild.serve.js';

const PORT = process.env.SERVE_TEST_PORT ? Number(process.env.SERVE_TEST_PORT) : 8700;
const ENGINE_HOST = 'localhost';
const ENGINE_PORT = 9076;

await rsbuildServe({
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
  open: false,
  entryWatcher: null,
  serveConfig: {
    themes: [],
    types: [],
    flags: {},
    anything: {},
    snapshots: [],
    renderConfigs: [],
    keyboardNavigation: false,
    resources: null,
    https: false,
    // Required by rsbuild.prod.js for the fixtures alias
    fixturePath: 'test/component',
    scripts: [],
    stylesheets: [],
  },
});

// eslint-disable-next-line no-console
console.log(`Serve test server ready at http://localhost:${PORT}`);
