const { test, expect } = require('@playwright/test');

test.describe('listbox', () => {
  const awaitText = async (page, selector, text, options = { timeout: 10000 }) => {
    await page.waitForSelector(selector, { state: 'visible' });
    await page.waitForFunction(
      ({ s, t }) => document.querySelector(s) && document.querySelector(s).innerText.includes(t),
      { s: selector, t: text },
      options
    );
  };
  const listboxSelector = `.listbox-container`;

  function getScenarioUrl(scenario) {
    return `${process.env.BASE_URL}/listbox/listbox.html?scenario=${scenario}`;
  }

  test('should resolve mount promise after data is fetched', async ({ page }) => {
    const url = getScenarioUrl('scenario1');
    await page.goto(url);

    await page.waitForSelector(listboxSelector, { state: 'visible' });
    await page.waitForSelector('#flow-tracker', { state: 'visible' });
    await awaitText(page, '#flow-tracker', 'mount promise resolved');

    // Wait for 2 seconds
    await page.waitForTimeout(2000);

    const innerText = await page.$eval('#flow-tracker', (el) => el.innerText);
    expect(innerText.includes('getLayout')).toBe(true);
    expect(innerText.includes('getListObjectData')).toBe(true);

    const actions = innerText.slice(0, -1).split(',');
    const lastAction = actions.pop();
    expect(lastAction).toBe('mount promise resolved');
  });
});
