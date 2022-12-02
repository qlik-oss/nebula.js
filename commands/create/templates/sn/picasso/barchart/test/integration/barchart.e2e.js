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
    await page.goto(`${process.env.BASE_URL}/render?fixture=scenario-1.fix.js`);
    await page.waitForSelector('.njs-viz[data-render-count="1"]', {
      visible: true,
    });
    const rects = await page.$$('rect[data-label]');
    expect(rects.length).toBe(20);
  });
});
