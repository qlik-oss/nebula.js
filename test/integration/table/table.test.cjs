const path = require('path');
const serve = require('@nebula.js/cli-serve');
const { test, expect } = require('@playwright/test');

const content = '.simple-table';

test.describe('Table visualization', () => {
  let s;

  test.beforeAll(async () => {
    s = await serve({
      entry: path.resolve(__dirname, 'sn-table'),
      config: 'nebula.config.cjs',
      open: false,
      fixturePath: 'test/integration/table',
    });
  });

  test.afterAll(async () => {
    if (s && s.close) await s.close();
  });

  test.describe('basic', () => {
    test.beforeEach(async ({ page }) => {
      const url = `${s.url}/render?fixture=table.fix.js`;
      await page.goto(url);
      await page.waitForSelector(content, { state: 'visible' });
    });

    test('should render a div', async ({ page }) => {
      const text = await page.textContent('.hello');
      expect(text).toBe('A simple table');
    });

    test('should be able to load json file', async ({ page }) => {
      const text = await page.textContent('.json-value');
      expect(text).toBe('Hi json! how are tou');
    });

    test('should be able to load css', async ({ page }) => {
      const bg = await page.evaluate(() => {
        return window.getComputedStyle(document.querySelector('.hello')).backgroundColor;
      });
      expect(bg).toBe('rgb(144, 41, 140)');
    });

    test('should have some data', async ({ page }) => {
      const text = await page.textContent('.table table tbody td');
      expect(text).toBe('A');
    });
  });
});
