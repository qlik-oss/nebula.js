const server = require('./server');

if (!process.env.BASE_URL) {
  let s;
  before(async () => {
    s = await server();
    process.env.BASE_URL = s.url;
    page.on('pageerror', e => {
      console.error('Web: ', e.message);
    });

    page.on('console', msg => {
      for (let i = 0; i < msg.args().length; ++i) {
        console.log(`console ${msg.text()}`);
      }
    });
  });

  after(async () => {
    await s.close();
  });
}
