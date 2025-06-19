module.exports = {
  // ...other config...
  reporter: [
    ['dot'],
    ['html', { outputFolder: './reports/html' }],
    ['junit', { outputFile: './test/rendering/reports/xml/report.xml' }],
  ],
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
