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

  before(async function setup() {
    this.timeout(15000); // to allow time for the server to start
    s = await serve({
      build: false,
      open: false,
      fixturePath: path.resolve(__dirname, 'fixtures'),
    });

    process.env.BASE_URL = s.url;
  });

  after(() => {
    s.close();
  });
}
