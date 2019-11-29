const serve = require('@nebula.js/cli-serve'); // eslint-disable-line

if (!process.env.BASE_URL) {
  let s;

  before(async function setup() {
    this.timeout(15000); // to allow time for the server to start
    s = await serve({
      build: false,
    });

    process.env.BASE_URL = s.url;

    page.on('pageerror', e => {
      console.log('Error:', e.message, e.stack);
    });
  });

  after(() => {
    s.close();
  });
}
