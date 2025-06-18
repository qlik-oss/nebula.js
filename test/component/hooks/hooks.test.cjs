const path = require('path');
const serve = require('@nebula.js/cli-serve');
const { test, expect } = require('@playwright/test');

const snSelector = '.njs-viz';

test.describe('hooks', () => {
  let s;
  let page;

  test.beforeAll(async ({ browser }) => {
    s = await serve({
      entry: path.resolve(__dirname, 'sn-hooks'),
      config: 'nebula.config.cjs',
      open: false,
      build: true,
      fixturePath: 'test/component/hooks',
      port: 0,
    });
    page = await browser.newPage();
    const url = `${s.url}/render?fixture=hooked.fix.js`;
    await page.goto(url);
    await page.waitForSelector(snSelector, { state: 'visible' });
  });

  test.afterAll(async () => {
    if (page) await page.close();
    if (s && s.close) await s.close();
  });

  test('usePromise', async () => {
    await expect(page.locator(`${snSelector}`)).toHaveAttribute('data-render-count', '1');
    await expect(page.locator(`${snSelector} .promise`)).toHaveText('ready!');
  });

  test('should render with initial state', async () => {
    await expect(page.locator(`${snSelector} .state`)).toHaveText('0');
    await expect(page.locator(`${snSelector} .action`)).toHaveText('false');
  });

  test('should update count state after first click', async () => {
    await page.click(snSelector);
    await expect(page.locator(`${snSelector} .state`)).toHaveText('1');
  });

  test('should update action state after second click', async () => {
    await page.click(snSelector);
    await expect(page.locator(`${snSelector} .action`)).toHaveText('true');
  });

  test('useLayout', async () => {
    await expect(page.locator(`${snSelector} .layout`)).toHaveText('true');
  });

  test('useAppLayout', async () => {
    await expect(page.locator(`${snSelector} .applayout`)).toHaveText('app-layout');
  });

  test('useTranslator', async () => {
    await expect(page.locator(`${snSelector} .translator`)).toHaveText('Cancel');
  });

  test('useDeviceType', async () => {
    await expect(page.locator(`${snSelector} .deviceType`)).toHaveText('desktop');
  });

  test('useTheme', async () => {
    await expect(page.locator(`${snSelector} .theme`)).toHaveText('#7b7a78');
  });

  test('useConstraints', async () => {
    await expect(page.locator(`${snSelector} .constraints`)).toHaveText('false:false:false');
  });

  test('useOptions', async () => {
    await expect(page.locator(`${snSelector} .options`)).toHaveText('opts');
  });

  test('useEmbed', async () => {
    await expect(page.locator(`${snSelector} .embed`)).toHaveText('function');
  });

  test('useEmitter', async () => {
    await expect(page.locator(`#events`)).toHaveText('A message from the Chart');
  });

  test('should have true MAGIC_FLAG', async () => {
    await expect(page.locator(`${snSelector} .flags`)).toHaveText('true:false');
  });
});
