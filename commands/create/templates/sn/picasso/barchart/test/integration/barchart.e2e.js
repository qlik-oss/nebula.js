const { test, expect } = require('@playwright/test');

test.describe('barchart', () => {
  test('should have 20 bars', async ({ page }) => {
    await page.goto('/render?fixture=scenario-1.fix.js');
    await page.waitForSelector('.njs-viz[data-render-count="1"]', {
      visible: true,
    });
    const rects = await page.$$('rect[data-label]');
    expect(rects.length).toBe(20);
  });
});
