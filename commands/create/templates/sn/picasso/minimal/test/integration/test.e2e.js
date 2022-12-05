/* eslint no-unused-vars: 0 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const serve = require('@nebula.js/cli-serve'); // eslint-disable-line

test.describe('barchart', () => {
  let server;

  test.beforeAll(async () => {
    server = await serve({
      build: false,
      open: false,
      fixturePath: path.resolve(__dirname, 'fixtures'),
    });
    process.env.BASE_URL = server.url;
  });

  test.afterAll(() => {
    server.close();
  });

  test('should have 20 bars', async ({ page }) => {
    // add your e2e tests here...
    // expect(1 + 1).toBe(2)
  });
});
