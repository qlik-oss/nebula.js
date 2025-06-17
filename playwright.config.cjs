module.exports = {
  timeout: 30000,
  retries: process.env.CI ? 0 : 0,
  workers: 1,
  use: {
    headless: true,
  },
  testDir: './test',
};
