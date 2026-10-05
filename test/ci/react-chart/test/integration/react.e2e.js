const { test, expect } = require('@playwright/test');

test.describe('react chart', () => {
  test('should render and be interactive', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/render?fixture=react.fix.js');
    await page.waitForSelector('.react-chart', { state: 'visible' }).catch((e) => {
      throw new Error(`chart did not render: ${errors.join('; ')}\n${e.message}`);
    });
    expect(await page.textContent('.react-title')).toBe('Hello React');

    await page.click('.react-button');
    expect(await page.textContent('.react-button')).toBe('Clicked 1');
    expect(errors).toEqual([]);
  });
});
