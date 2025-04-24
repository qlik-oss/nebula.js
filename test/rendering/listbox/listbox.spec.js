import { test, expect } from '@playwright/test';
import { act } from '@testing-library/react';
import fs from 'fs';
import getPage from '../setup';
import startServer, { getPaths } from '../server';
import { execSequence } from '../testUtils';

const paths = getPaths('listbox/__fixtures__');

const shouldIgnoreFile = (file) => {
  const IGNORE_PATTERNS = [];
  const INCLUDE_PATTERNS = [/\.js/];
  const ignore =
    IGNORE_PATTERNS.some((P) => file.search(P) > -1) || INCLUDE_PATTERNS.some((P) => file.search(P) === -1);
  return ignore;
};

test.describe('listbox mashup rendering test', () => {
  const object = '[data-type="listbox"]';
  const listboxSelector = `${object} .listbox-container`;
  const toolbarPopoverSelector = '[data-testid="njs-action-toolbar-popover"]';
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

  test('listbox basic', async () => {
    const FILE_NAME = 'listbox_basic.png';

    await page.goto(`${url}/listbox/listbox.html?scenario=standard`, { waitUntil: 'networkidle' });
    const locator = page.locator(listboxSelector);
    await locator.waitFor();
    return expect(locator).toHaveScreenshot(FILE_NAME, { caret: 'hide' });
  });

  test('selecting two values should result in two green rows', async () => {
    const FILE_NAME = 'listbox_select_EH.png';

    await page.goto(`${url}/listbox/listbox.html?scenario=standard`, { waitUntil: 'networkidle' });
    const locator = page.locator(listboxSelector);
    await locator.waitFor();

    const selectNumbers = [4, 7];
    const action = async (nbr) => {
      const rowSelector = `${listboxSelector} [data-n="${nbr}"]`;
      await page.click(rowSelector);
    };
    await execSequence(selectNumbers, action);

    return expect(locator).toHaveScreenshot(FILE_NAME, { caret: 'hide' });
  });

  test('selecting two values in dense listbox should result in two green rows', async () => {
    const FILE_NAME = 'listbox_dense_select.png';

    await page.goto(`${url}/listbox/listbox.html?scenario=dense`, { waitUntil: 'networkidle' });
    const locator = page.locator(listboxSelector);
    await locator.waitFor();

    const selectNumbers = [4, 7];
    const action = async (nbr) => {
      const rowSelector = `${listboxSelector} [data-n="${nbr}"]`;
      await page.click(rowSelector);
    };
    await execSequence(selectNumbers, action);

    return expect(locator).toHaveScreenshot(FILE_NAME, { caret: 'hide' });
  });

  test('selecting values should not show the selections toolbar when autoConfirm is true', async () => {
    const FILE_NAME = 'listbox_select_EH_auto_confirm.png';

    await page.goto(`${url}/listbox/listbox.html?scenario=autoConfirm`, { waitUntil: 'networkidle' });

    const locator = page.locator(listboxSelector);
    await locator.waitFor();

    const selectNumbers = [4, 7];
    const action = async (nbr) => {
      const rowSelector = `${listboxSelector} [data-n="${nbr}"]`;
      await page.click(rowSelector);
    };
    await execSequence(selectNumbers, action);

    return expect(locator).toHaveScreenshot(FILE_NAME, { caret: 'hide' });
  });

  test('listbox search', async () => {
    const FILE_NAME = 'listbox_search_B.png';
    const searchSelector = '.search input';

    await page.goto(`${url}/listbox/listbox.html?scenario=standard`, { waitUntil: 'networkidle' });
    const search = await page.waitForSelector(searchSelector, { visible: true });

    await search.click();
    await search.fill('B');

    const locator = page.locator(listboxSelector);
    await locator.waitFor();
    return expect(locator).toHaveScreenshot(FILE_NAME, { caret: 'hide' });
  });

  test('listbox search dark', async () => {
    const FILE_NAME = 'listbox_search_dark_B.png';
    const searchSelector = '.search input';

    await page.goto(`${url}/listbox/listbox.html?scenario=standard&theme=dark`, { waitUntil: 'networkidle' });
    const search = await page.waitForSelector(searchSelector, { visible: true });

    await search.click();
    await search.fill('B');

    const locator = page.locator(listboxSelector);
    await locator.waitFor();
    return expect(locator).toHaveScreenshot(FILE_NAME, { caret: 'hide' });
  });

  test('hide toolbar', async () => {
    const FILE_NAME = 'listbox_no_toolbar.png';

    await page.goto(`${url}/listbox/listbox.html?scenario=noToolbar`, { waitUntil: 'networkidle' });

    const locator = page.locator(listboxSelector);
    await locator.waitFor();
    return expect(locator).toHaveScreenshot(FILE_NAME, { caret: 'hide' });
  });

  test('long title should detach toolbar', async () => {
    const FILE_NAME = 'listbox_detached_toolbar.png';

    await page.goto(`${url}/listbox/listbox.html?scenario=longTitle`, { waitUntil: 'networkidle' });
    const locator = page.locator(listboxSelector);
    await locator.waitFor();

    act(async () => {
      await page.click(listboxSelector);
    });

    await page.waitForSelector(toolbarPopoverSelector);
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });

    return expect(locator).toHaveScreenshot(FILE_NAME);
  });

  test.describe('fixtures', () => {
    fs.readdirSync(paths).forEach((file) => {
      if (shouldIgnoreFile(file)) {
        return;
      }
      const name = file.replace('.fix.js', '');
      const fixturePath = `./__fixtures__/${file}`;

      test(name, async () => {
        const renderUrl = `${url}/listbox/listbox.html?fixture=${fixturePath}`;

        await page.goto(renderUrl, { waitUntil: 'networkidle' });

        const locator = page.locator(listboxSelector);
        await locator.waitFor();

        return expect(locator).toHaveScreenshot(`${name}.png`, { caret: 'hide' });
      });
    });
  });
});
