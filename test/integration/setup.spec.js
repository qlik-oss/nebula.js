const build = require('../__serve__/build');

before(async () => {
  await build();

  page.on('pageerror', (e) => {
    console.log('error', e.message);
  });

  page.on('console', (msg) => {
    for (let i = 0; i < msg.args().length; ++i) {
      console.log(`console ${msg.text()}`);
    }
  });
});
