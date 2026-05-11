import { defineConfig } from '@playwright/test';

const PORT = process.env.SERVE_TEST_PORT ? Number(process.env.SERVE_TEST_PORT) : 8700;

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,

  // Store snapshots without a platform suffix so a single set of baselines is
  // committed to the repo.
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',

  // On CI, always overwrite snapshots instead of comparing — font rendering
  // differs enough between macOS (local) and Linux (CI) to cause false
  // failures. The tests still guard against crashes, missing elements, and
  // broken interactions; pixel-level regression is enforced locally.
  updateSnapshots: process.env.CI ? 'all' : 'none',

  expect: {
    toMatchSnapshot: { threshold: 0.01 },
    timeout: 30000,
  },

  // Run tests serially — the dev server is shared and WebSocket mocks are per-page
  workers: 1,

  reporter: [['list'], ['html', { outputFolder: './reports/html', open: 'never' }]],

  use: {
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    // Keep screenshots and video on failure for debugging
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Start the serve dev server before running tests.
  // In production mode it serves the pre-built dist/ bundle immediately —
  // no webpack compilation, so startup is fast.
  webServer: {
    command: `node server.js`,
    url: `http://localhost:${PORT}`,
    // Re-use an already-running server in local development
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
