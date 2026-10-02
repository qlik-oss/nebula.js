const { test, expect } = require('@playwright/test');

test.describe('react chart', () => {
  test('should render and be interactive', async ({ page }) => {
    await page.goto('/render?fixture=react.fix.js');
    await page.waitForSelector('.react-chart', { state: 'visible' });
    expect(await page.textContent('.react-title')).toBe('Hello React');

    await page.click('.react-button');
    expect(await page.textContent('.react-button')).toBe('Clicked 1');
  });
});
