const path = require('path');
const serve = require('@nebula.js/cli-serve');
const { test, expect } = require('@playwright/test');

const snSelector = '.njs-viz';

test.describe('bar chart', () => {
  let s;

  test.beforeAll(async () => {
    s = await serve({
      entry: path.resolve(__dirname, 'sn-barchart'),
      config: 'nebula.config.cjs',
      open: false,
      build: true,
      fixturePath: 'test/component/barchart',
    });
  });

  test.afterAll(async () => {
    await s.close();
  });

  test('renders', async ({ page }) => {
    const url = `${s.url}/render?fixture=barchart.fix.js`;
    await page.goto(url);
    await page.waitForSelector(snSelector, { state: 'visible' });
    await expect(page.locator(snSelector)).toHaveAttribute('data-render-count', '1');
  });
});
