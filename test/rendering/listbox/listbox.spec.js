import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const getPage = require('../setup');
const startServer = require('../server');
const { execSequence } = require('../testUtils');

const paths = path.join(__dirname, '__fixtures__');

test.describe('listbox mashup rendering test', () => {
  const object = '[data-type="listbox"]';
  const listboxSelector = `${object} .listbox-container`;
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

    await page.goto(`${url}/listbox/listbox.html?scenario=standard`);
    const selector = await page.waitForSelector(listboxSelector, { visible: true });

    const image = await selector.screenshot({ caret: 'hide' });
    return expect(image).toMatchSnapshot(FILE_NAME);
  });

  test('selecting two values should result in two green rows', async () => {
    const FILE_NAME = 'listbox_select_EH.png';

    await page.goto(`${url}/listbox/listbox.html?scenario=standard`);
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

  test('should render checkboxes and check A and I', async () => {
    const FILE_NAME = 'listbox_checkboxes_select_AI.png';

    await page.goto(`${url}/listbox/listbox.html?scenario=checkboxes`);
    const selector = await page.waitForSelector(listboxSelector, { visible: true });

    const selectNumbers = [0, 8];
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

    await page.goto(`${url}/listbox/listbox.html?scenario=standard`);
    const search = await page.waitForSelector(searchSelector, { visible: true });

    await search.click();
    await search.fill('B');

    // Note that since we don't have a backend providing search results, we can't test highlighting and selected (green) rows.
    const selector = await page.$(listboxSelector);
    const image = await selector.screenshot({ caret: 'hide' });
    return expect(image).toMatchSnapshot(FILE_NAME);
  });

  test('hide toolbar', async () => {
    const FILE_NAME = 'listbox_no_toolbar.png';

    await page.goto(`${url}/listbox/listbox.html?scenario=noToolbar`);

    // Note that since we don't have a backend providing search results, we can't test highlighting and selected (green) rows.
    const selector = await page.$(listboxSelector);
    const image = await selector.screenshot({ caret: 'hide' });
    return expect(image).toMatchSnapshot(FILE_NAME);
  });

  test('hovering and pressing arrow down should scroll listbox', async () => {
    const FILE_NAME = 'listbox_key_scroll.png';

    await page.goto(`${url}/listbox/listbox.html?scenario=standard`);
    const selector = await page.waitForSelector(listboxSelector, { visible: true });

    await page.hover(listboxSelector);
    await page.press(listboxSelector, 'ArrowDown');

    const image = await selector.screenshot({ caret: 'hide' });
    return expect(image).toMatchSnapshot(FILE_NAME);
  });

  test.describe('fixtures', () => {
    fs.readdirSync(paths).forEach((file) => {
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
