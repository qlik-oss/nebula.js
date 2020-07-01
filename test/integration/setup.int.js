const path = require('path');
const serve = require('@nebula.js/cli-serve'); // eslint-disable-line

page.on('pageerror', (e) => {
  console.error('Web: ', e.message);
});

page.on('console', (msg) => {
  for (let i = 0; i < msg.args().length; ++i) {
    console.log(`console ${msg.text()}`);
  }
});

if (!process.env.BASE_URL) {
  let s;

  before(async () => {
    s = await serve({
      entry: path.resolve(__dirname, '../fixtures/viz/table'),
      open: false,
    });

    process.env.BASE_URL = s.url;
  });

  after(() => {
    s.close();
  });
}
