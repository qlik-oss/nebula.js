const serve = require('@nebula.js/cli-serve'); // eslint-disable-line

let s;

before(async () => {
  s = await serve({
    open: false,
  });

  process.testServer = s;

  page.on('pageerror', e => {
    console.log('Error:', e.message, e.stack);
  });
});

after(() => {
  s.close();
});
