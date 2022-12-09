const getPage = require('../setup');
const startServer = require('../server');
const { looksLike } = require('../testUtils');

describe('listbox mashup rendering test', () => {
  const object = '[data-type="sheet"]';
  let page;
  let takeScreenshot;
  let destroyServer;
  let destroyBrowser;
  const PAGE_OPTIONS = { width: 300, height: 500 };

  beforeEach(async () => {
    ({ destroy: destroyServer } = await startServer());
    ({ page, takeScreenshot, destroy: destroyBrowser } = await getPage(PAGE_OPTIONS));
  });

  afterEach(async () => {
    await Promise.all([destroyServer(), destroyBrowser()]);
  });

  it('selecting two values should result in two green rows', async () => {
    const FILE_NAME = 'sheet_basic_EH.png';
    const snapshotElement = await page.$(object);
    await page.$('#bar');
    await page.$('#pie');
    const { path: capturedPath } = await takeScreenshot(FILE_NAME, snapshotElement);
    await looksLike(FILE_NAME, capturedPath);
  });
});
