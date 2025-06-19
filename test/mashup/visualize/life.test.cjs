const { test, expect } = require('@playwright/test');

test.describe('object lifecycle', () => {
  // Helper to wait for a selector to have specific text
  async function waitForTextStatus(page, selector, text, options = { timeout: 1000 }) {
    await expect(page.locator(selector)).toHaveText(text, options);
  }

  // Helper to build scenario URLs
  function getScenarioUrl(scenario) {
    return `${process.env.BASE_URL}/visualize/life.html?scenario=${scenario}`;
  }

  test('should fail to load unknown type', async ({ page }) => {
    await page.goto(getScenarioUrl('invalid-type'));
    await waitForTextStatus(
      page,
      '[data-tid="error-title"]',
      "Could not find a version of 'voooz' that supports current object version. Did you forget to register voooz?"
    );
    await waitForTextStatus(
      page,
      '[data-tid="error-external"]',
      "Could not find a version of 'voooz' that supports current object version. Did you forget to register voooz?"
    );
  });

  test('should show spinner and requirements for known type', async ({ page }) => {
    await page.goto(getScenarioUrl('valid-type'));
    // should show loading spinner
    await page.waitForSelector('.njs-cell [role="progressbar"]', { timeout: 3000 });
    await waitForTextStatus(page, '[data-tid="error-title"]', 'Incomplete visualization');
  });

  test('should render long running query', async ({ page }) => {
    test.setTimeout(15000);
    const url = getScenarioUrl('long-running');
    await page.goto(url);
    await waitForTextStatus(page, '[data-tid="update-active"]', 'Updating data');

    // the cancel button should appear after 2000ms
    await page.click('.njs-cell button');
    await waitForTextStatus(page, '[data-tid="update-cancelled"]', 'Data update was cancelled');
    // Retry
    await waitForTextStatus(page, '.njs-cell button', 'Retry');
    await page.click('.njs-cell button');

    await waitForTextStatus(page, '.rendered', 'Success!', { timeout: 7000 });
  });

  // need to fix calc condition view first
  test('should show calculation unfulfilled', async ({ page }) => {
    const url = getScenarioUrl('calc-unfulfilled');
    await page.goto(url);
    await waitForTextStatus(page, '[data-tid="error-title"]', 'The calculation condition is not fulfilled');
  });

  test('should render error when a hypercube contains a qError', async ({ page }) => {
    const url = getScenarioUrl('hypercube-error');
    await page.goto(url);
    await waitForTextStatus(page, '[data-tid="error-title"]', 'Error');
  });

  test('should render when requirements are fulfilled', async ({ page }) => {
    const url = getScenarioUrl('valid-config');
    await page.goto(url);
    await waitForTextStatus(page, '.rendered', 'Success!');
  });

  test('should destroy', async ({ page }) => {
    const url = getScenarioUrl('destroy');
    await page.goto(url);
    // wait for some time to ensure destroy has been run and no errors are thrown
    await page.waitForTimeout(5000);
  });
});
