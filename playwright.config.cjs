module.exports = {
  timeout: 30000,
  retries: process.env.CI ? 0 : 0,
  workers: 1,
  use: {
    headless: true,
  },
  testDir: './test',
  reporter: [
    ['html'],
    ['junit', { outputFile: `./test-results/${process.env.PLAYWRIGHT_JUNIT_OUTPUT_NAME || 'junit.xml'}` }],
  ],
};
