const { chromium } = require('@playwright/test');

async function getPage() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(30000);
  page.setDefaultTimeout(30000);

  const destroy = async () => {
    await browser.close();
  };

  return { browser, page, destroy };
}

module.exports = getPage;
