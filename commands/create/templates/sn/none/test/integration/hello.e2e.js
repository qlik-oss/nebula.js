const { test, expect } = require('@playwright/test');

test.describe('sn', () => {
  test('should say hello', async ({ page }) => {
    const content = '.njs-viz[data-render-count="1"]';
    await page.goto('/render?fixture=hello.fix.js');
    await page.waitForSelector(content, { visible: true });
    const text = await page.$eval(content, (el) => el.textContent);
    expect(text).toBe('Hello!');
  });
});
