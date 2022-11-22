const getPage = require('../setup');
const startServer = require('../server');
const { execSequence, looksLike } = require('../testUtils');

describe('listbox mashup rendering test', () => {
  const object = '[data-type="listbox"]';
  const listboxSelector = `${object} .listbox-container`;
  let page;
  let takeScreenshot;
  let destroyServer;
  let destroyBrowser;
  let url;
  const PAGE_OPTIONS = { width: 300, height: 500 };

  beforeEach(async () => {
    ({ url, destroy: destroyServer } = await startServer());
    ({ page, takeScreenshot, destroy: destroyBrowser } = await getPage(PAGE_OPTIONS));
  });

  afterEach(async () => {
    await Promise.all([destroyServer(), destroyBrowser()]);
  });

  it('selecting two values should result in two green rows', async () => {
    const FILE_NAME = 'listbox_select_EH.png';

    await page.goto(`${url}/listbox/listbox.html`);
    await page.waitForSelector(listboxSelector, { visible: true });

    const selectNumbers = [4, 7];
    const action = async (nbr) => {
      const rowSelector = `${listboxSelector} [data-n="${nbr}"]`;
      await page.click(rowSelector);
    };

    await execSequence(selectNumbers, action);

    const snapshotElement = await page.$(listboxSelector);
    const { path: capturedPath } = await takeScreenshot(FILE_NAME, snapshotElement);
    await looksLike(FILE_NAME, capturedPath);
  });
});
