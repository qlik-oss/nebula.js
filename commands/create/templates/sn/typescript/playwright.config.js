import { devices } from '@playwright/test';

export default {
  testMatch: /.*\.e2e\.js/,
  outputDir: './test/integration/artifacts/',

  reporter: [
    ['list'],
    ['json', { outputFile: './test/integration/test-report/test-results.json' }],
    [
      'html',
      {
        outputFolder: './test/integration/test-report',
        open: process.env.SKIP_OPEN_REPORT ? 'never' : 'on-failure',
      },
    ],
  ],

  webServer: {
    command: 'yarn start --port 8077 --open false',
    reuseExistingServer: !process.env.CI,
    port: '8077',
  },

  use: {
    baseURL: 'http://localhost:8077',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      headless: true,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
};
