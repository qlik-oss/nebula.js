
// const build = require('../__serve__/build');
const path = require('path');
const serve = require('@nebula.js/cli-serve'); // eslint-disable-line

let s;

before(async () => {
  s = await serve({
    sn: path.resolve(__dirname, 'sn'),
  });

  process.testServer = s;

  page.on('pageerror', (e) => {
    console.error('Web: ', e.message);
  });

  // page.on('console', (msg) => {
  //   for (let i = 0; i < msg.args().length; ++i) {
  //     console.log(`console ${msg.text()}`);
  //   }
  // });
});

after(() => {
  s.close();
});
