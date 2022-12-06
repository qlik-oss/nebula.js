const { test, expect } = require('@playwright/test');
const path = require('path');
const serve = require('@nebula.js/cli-serve'); // eslint-disable-line

test.describe('sn', () => {
  let server;

  test.beforeAll(async () => {
    server = await serve({
      build: false,
      open: false,
      fixturePath: path.resolve(__dirname, 'fixtures'),
    });
    process.env.BASE_URL = server.url;
  });

  test.afterAll(() => {
    server.close();
  });

  test('should say hello', async ({ page }) => {
    const content = '.njs-viz[data-render-count="1"]';

    const url = `${process.env.BASE_URL}/render?fixture=hello.fix.js`;
    await page.goto(url);
    await page.waitForSelector(content, { visible: true });
    const text = await page.$eval(content, (el) => el.textContent);
    expect(text).toBe('Hello!');
  });
});
