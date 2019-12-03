const path = require('path');
const serve = require('@nebula.js/cli-serve'); // eslint-disable-line

if (!process.env.BASE_URL) {
  let s;
  process.env.MONO = true;
  before(async () => {
    s = await serve({
      entry: path.resolve(__dirname, 'sn.js'),
      open: false,
      build: false,
    });

    process.env.BASE_URL = s.url;

    page.on('pageerror', e => {
      console.error('Web: ', e.message);
    });

    page.on('console', msg => {
      for (let i = 0; i < msg.args().length; ++i) {
        const text = msg.text();
        if (text.includes('WDS') || text.includes('React DevTools')) {
          return;
        }
        console.log(`console ${text}`);
      }
    });
  });

  after(() => {
    s.close();
  });
}
