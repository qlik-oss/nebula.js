const serve = require('@nebula.js/cli-serve');
const { test, expect } = require('@playwright/test');

const snSelector = '.njs-viz';
const errorSelector = '.njs-cell [data-tid="error-title"]';

test.describe('sn', () => {
  let s;

  test.beforeAll(async () => {
    try {
      console.log('Starting serve...');
      s = await serve({
        open: false,
        config: 'nebula.config.cjs',
        build: false,
        fixturePath: 'test/component/object',
      });
      console.log('Serve started:', s && s.url);
    } catch (err) {
      console.error('Serve failed:', err);
    }
  }, 60000); // Increase timeout

  test.afterAll(async () => {
    if (s && s.close) {
      await s.close();
    }
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
