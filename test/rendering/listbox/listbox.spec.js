import { test, expect } from '@playwright/test';
import { act } from '@testing-library/react';
import fs from 'fs';
import path from 'path';

const getPage = require('../setup');
const startServer = require('../server');
const { execSequence } = require('../testUtils');

const paths = path.join(__dirname, '__fixtures__');

function shouldIgnoreFile(file) {
  // Ignore subpaths
  const IGNORE_PATTERNS = [];
  const INCLUDE_PATTERNS = [/\.js/];
  const ignore =
    IGNORE_PATTERNS.some((P) => file.search(P) > -1) || INCLUDE_PATTERNS.some((P) => file.search(P) === -1);
  return ignore;
}

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
    ({ url, destroy: destroyServer } = await startServer(8050));
    ({ page, destroy: destroyBrowser } = await getPage());
  });

  test.afterEach(async () => {
    await Promise.all([destroyServer(), destroyBrowser()]);
  });

  test('listbox basic', async () => {
    const FILE_NAME = 'listbox_basic.png';

    await page.goto(`${url}/listbox/listbox.html?scenario=standard`, { waitUntil: 'networkidle' });
    const selector = await page.waitForSelector(listboxSelector, { visible: true });

    const image = await selector.screenshot({ caret: 'hide' });
    return expect(image).toMatchSnapshot(FILE_NAME);
  });

  test('selecting two values should result in two green rows', async () => {
    const FILE_NAME = 'listbox_select_EH.png';

    await page.goto(`${url}/listbox/listbox.html?scenario=standard`, { waitUntil: 'networkidle' });
    const selector = await page.waitForSelector(listboxSelector, { visible: true });

    const selectNumbers = [4, 7];
    const action = async (nbr) => {
      const rowSelector = `${listboxSelector} [data-n="${nbr}"]`;
      await page.click(rowSelector);
    };
    await execSequence(selectNumbers, action);

    const image = await selector.screenshot({ caret: 'hide' });
    return expect(image).toMatchSnapshot(FILE_NAME);
  });

  test('listbox search', async () => {
    const FILE_NAME = 'listbox_search_B.png';
    const searchSelector = '.search input';

    await page.goto(`${url}/listbox/listbox.html?scenario=standard`, { waitUntil: 'networkidle' });
    const search = await page.waitForSelector(searchSelector, { visible: true });

    await search.click();
    await search.fill('B');

    // Note that since we don't have a backend providing search results, we can't test highlighting and selected (green) rows.
    const selector = await page.locator(listboxSelector);
    const image = await selector.screenshot({ caret: 'hide' });
    return expect(image).toMatchSnapshot(FILE_NAME);
  });

  test('listbox search dark', async () => {
    const FILE_NAME = 'listbox_search_dark_B.png';
    const searchSelector = '.search input';

    await page.goto(`${url}/listbox/listbox.html?scenario=standard&theme=dark`, { waitUntil: 'networkidle' });
    const search = await page.waitForSelector(searchSelector, { visible: true });

    await search.click();
    await search.fill('B');

    // Note that since we don't have a backend providing search results, we can't test highlighting and selected (green) rows.
    const selector = await page.locator(listboxSelector);
    const image = await selector.screenshot({ caret: 'hide' });
    return expect(image).toMatchSnapshot(FILE_NAME);
  });

  test('hide toolbar', async () => {
    const FILE_NAME = 'listbox_no_toolbar.png';

    await page.goto(`${url}/listbox/listbox.html?scenario=noToolbar`, { waitUntil: 'networkidle' });

    // Note that since we don't have a backend providing search results, we can't test highlighting and selected (green) rows.
    const selector = await page.locator(listboxSelector);
    const image = await selector.screenshot({ caret: 'hide' });
    return expect(image).toMatchSnapshot(FILE_NAME);
  });

  test('long title should detach toolbar', async () => {
    const FILE_NAME = 'listbox_detached_toolbar.png';

    await page.goto(`${url}/listbox/listbox.html?scenario=longTitle`, { waitUntil: 'networkidle' });
    const selector = await page.waitForSelector(listboxSelector, { visible: true });

    act(async () => {
      await page.click(listboxSelector);
    });

    await page.waitForSelector(toolbarPopoverSelector);
    // Wait for animation
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });

    const image = await selector.screenshot({ caret: 'hide' });
    return expect(image).toMatchSnapshot(FILE_NAME);
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

        const element = await page.waitForSelector(listboxSelector, {
          visible: true,
          timeout: 10000,
        });

        const screenshot = await page.screenshot({ clip: await element.boundingBox() });

        expect(screenshot).toMatchSnapshot(`${name}.png`);
      });
    });
  });
});
