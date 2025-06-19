module.exports = {
  // ...other config...
  globalSetup: require.resolve('./setup.cjs'),
  timeout: 10000,
  workers: 1,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
};
