const path = require('path');
const serve = require('@nebula.js/cli-serve'); // eslint-disable-line
const puppeteerUtil = require('../../utils/puppeteer-util.cjs');

describe('bar chart', () => {
  const snSelector = '.njs-viz';
  let s;

  before(async () => {
    s = await serve({
      entry: path.resolve(__dirname, 'sn-barchart'),
      config: 'nebula.config.cjs',
      open: false,
      build: true,
      fixturePath: 'test/component/barchart',
      host: '0.0.0.0',
    });
    puppeteerUtil.addListeners(page);
  });

  after(() => {
    s.close();
    puppeteerUtil.removeListeners(page);
  });

  it('renders', async () => {
    const url = `${s.url.replace('0.0.0.0', '172.17.0.1')}/render?fixture=barchart.fix.js`;
    await page.goto(url);
    await page.waitForSelector(snSelector, { visible: true });
    await page.waitForFunction(
      (selector) => document.querySelector(selector).getAttribute('data-render-count') === '1',
      {},
      `${snSelector}`
    );
  });
});
