const server = require('./server.cjs');
const { test } = require('@playwright/test');

let s;

test.beforeAll(async () => {
  console.log('Starting server for mashup tests...');
  s = await server();
  process.env.BASE_URL = s.url;
});

test.afterAll(async () => {
  if (s && s.close) {
    await s.close();
  }
});
