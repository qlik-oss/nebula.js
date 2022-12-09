const puppeteer = require('puppeteer');
const path = require('path');

const artifactsPath = path.join(__dirname, './__artifacts__');

async function getPage(options = {}) {
  const { width, height } = options;

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    // Uncomment these for debugging the test visually.
    // headless: false,
    // slowMo: 200,
  });
  if (!browser) {
    throw new Error('puppeteer could not launch browser');
  }
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  page.setDefaultNavigationTimeout(30000);
  page.setDefaultTimeout(30000);

  const destroy = async () => {
    await browser.close();
  };

  /**
   *
   * @param {string} fileName The name of the output file, should match the baseline version's name.
   * @param {HTMLElement} elm If you want to restrict the screenshot area to a certain element.
   * @returns {Promise} Resolves the absolute path to the screenshot.
   */
  const takeScreenshot = async (fileName, elm = undefined) => {
    const screenshotPath = path.resolve(artifactsPath, './temp', fileName);
    const clip = await elm?.boundingBox();
    await page.screenshot({ clip, path: screenshotPath });
    return { path: screenshotPath };
  };
  return { browser, page, destroy, takeScreenshot };
}

module.exports = getPage;
