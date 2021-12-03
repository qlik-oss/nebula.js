const path = require('path');
const serve = require('@nebula.js/cli-serve'); // eslint-disable-line
const puppeteerUtil = require('../utils/puppeteer-util');

if (!process.env.BASE_URL) {
  let s;
  process.env.MONO = true;
  before(async () => {
    s = await serve({
      entry: path.resolve(__dirname, 'sn.js'),
      open: false,
      build: false,
      fixturePath: 'test/component',
    });
    process.env.BASE_URL = s.url;
    puppeteerUtil.addListeners(page);
  });

  after(() => {
    s.close();
    puppeteerUtil.removeListeners(page);
  });
}
