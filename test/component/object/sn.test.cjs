const serve = require('@nebula.js/cli-serve');
const { test, expect } = require('@playwright/test');

const snSelector = '.njs-viz';
const errorSelector = '.njs-cell [data-tid="error-title"]';

test.describe('sn', () => {
  let s;

  test.beforeAll(async () => {
    s = await serve({
      entry: path.resolve(__dirname),
      config: 'nebula.config.cjs',
      open: false,
      build: false,
      fixturePath: 'test/component/object',
      port: 0,
    });
  });

  test.afterAll(async () => {
    await s.close();
  });

  test('should render with translation', async ({ page }) => {
    const url = s.url + '/render?fixture=sn-locale.fix.js&language=sv-SE';
    await page.goto(url);
    await page.waitForSelector(snSelector, { state: 'visible' });
    const text = await page.textContent(snSelector);
    expect(text).toContain('Hej motor!');
  });

  test('should show incomplete visualization', async ({ page }) => {
    const url = s.url + '/render?fixture=sn-incomplete.fix.js&theme=dark';
    await page.goto(url);
    await page.waitForSelector(errorSelector, { state: 'visible' });
    const text = await page.textContent(errorSelector);
    expect(text).toContain('Incomplete visualization');
  });

  test('should show error caused during load', async ({ page }) => {
    const url = s.url + '/render?fixture=sn-error.fix.js';
    await page.goto(url);
    await page.waitForSelector(errorSelector, { state: 'visible' });
    const text = await page.textContent(errorSelector);
    expect(text).toContain('hahaha');
  });
});
