import { test, expect } from '@playwright/test';
import getPage from '../setup';
import startServer from '../server';

test.describe('snapper rendering test', () => {
  const object = '[data-type="bar"]';
  const barSelector = `${object} .njs-viz`;
  let page;

  let destroyServer;
  let destroyBrowser;
  let url;

  test.use({ viewport: { width: 300, height: 500 } });

  test.beforeEach(async () => {
    ({ url, destroy: destroyServer } = await startServer(8049));
    ({ page, destroy: destroyBrowser } = await getPage());
  });

  test.afterEach(async () => {
    await Promise.all([destroyServer(), destroyBrowser()]);
  });

  test('should capture an image of a bar', async () => {
    const FILE_NAME = 'bar.png';

    await page.goto(`${url}/snaps/snapper.html`);

    const locator = page.locator(barSelector);
    await locator.waitFor();
    return expect(locator).toHaveScreenshot(FILE_NAME, { caret: 'hide' });
  });
});
