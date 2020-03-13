const server = require('./server');

page.on('pageerror', e => {
  console.error('Web: ', e.message);
});

page.on('console', msg => {
  for (let i = 0; i < msg.args().length; ++i) {
    console.log(`console ${msg.text()}`);
  }
});

if (!process.env.BASE_URL) {
  let s;
  before(async () => {
    s = await server();
    process.env.BASE_URL = s.url;
  });

  after(async () => {
    await s.close();
  });
}
