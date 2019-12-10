/* eslint no-param-reassign: 0 */

const puppeteer = require('puppeteer');

function snapshooter({ snapshotUrl, chrome = {} } = {}) {
  const snapshots = {};
  const images = {};
  let browser;
  let cachedPage;
  let rendering = false;

  const hasConnectOptions = chrome.browserWSEndpoint || chrome.browserURL;

  const createBrowser = () => (hasConnectOptions ? puppeteer.connect(chrome) : puppeteer.launch(chrome));

  const doIt = async (snapshot, runCached) => {
    browser = browser || (await createBrowser());
    let page;
    if (runCached) {
      cachedPage = cachedPage || (await browser.newPage());
      page = cachedPage;
    } else {
      page = await browser.newPage();
    }
    await page.setViewport({
      width: snapshot.meta.size.width,
      height: snapshot.meta.size.height,
    });
    await page.goto(`${snapshotUrl}?snapshot=${snapshot.key}`);
    try {
      await page.waitFor(
        () =>
          (document.querySelector('.nebulajs-sn') &&
            +document.querySelector('.nebulajs-sn').getAttribute('data-render-count') > 0) ||
          document.querySelector('[data-njs-error]')
      );
    } catch (e) {
      // empty
    }
    const image = await page.screenshot();
    images[snapshot.key] = image;
    rendering = false;
    return snapshot.key;
  };

  return {
    getStoredImage(id) {
      return images[id];
    },
    getStoredSnapshot(id) {
      return snapshots[id];
    },
    storeSnapshot(snapshot) {
      if (!snapshot) {
        throw new Error('Empty snapshot');
      }
      if (!snapshot.key) {
        snapshot.key = String(+Date.now());
      }
      snapshots[snapshot.key] = snapshot;
      return snapshot.key;
    },
    async captureImageOfSnapshot(snapshot) {
      this.storeSnapshot(snapshot);
      if (rendering) {
        return doIt(snapshot);
      }
      rendering = true;
      const key = await doIt(snapshot, true);
      rendering = false;
      return key;
    },
    async close() {
      if (browser) {
        await browser.close();
      }
    },
  };
}
module.exports = snapshooter;
