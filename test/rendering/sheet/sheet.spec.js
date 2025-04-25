import { test, expect } from '@playwright/test';
import getPage from '../setup';
import startServer from '../server';

test.describe('sheet mashup rendering test', () => {
  const object = '[data-type="sheet"]';
  let page;
  let destroyServer;
  let destroyBrowser;

  let url;
  const PAGE_OPTIONS = { width: 600, height: 500 };

  test.beforeEach(async () => {
    ({ url, destroy: destroyServer } = await startServer(8051));
    ({ page, destroy: destroyBrowser } = await getPage(PAGE_OPTIONS));
  });

  test.afterEach(async () => {
    await Promise.all([destroyServer(), destroyBrowser()]);
  });

  test('sheet basic test', async () => {
    const FILE_NAME = 'sheet_basic.png';

    await page.goto(`${url}/sheet/sheet.html?target=sheet`);
    const locator = page.locator(object);
    await locator.waitFor();
    return expect(locator).toHaveScreenshot(FILE_NAME, { caret: 'hide' });
  });

  test('sheet bound Less test', async () => {
    const FILE_NAME = 'sheet_bound_less.png';

    await page.goto(`${url}/sheet/sheet.html?target=boundLessSheet`);
    const locator = page.locator(object);
    await locator.waitFor();
    return expect(locator).toHaveScreenshot(FILE_NAME, { caret: 'hide' });
  });
});
