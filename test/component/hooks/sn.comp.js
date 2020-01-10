describe('hooks', () => {
  const snSelector = '.nebulajs-sn';

  before(async () => {
    await page.goto(`${process.env.BASE_URL}/render/?fixture=./hooks/hooked.fix.js`);
    await page.waitForSelector(snSelector, { visible: true });
  });

  it('should render with initial state', async () => {
    const text = await page.$eval(`${snSelector} .state`, el => el.textContent);
    expect(text).to.equal('0');
  });

  it('should update count state after click', async () => {
    await page.click(snSelector);
    await page.waitForFunction(
      selector => document.querySelector(selector).textContent === '1',
      {},
      `${snSelector} .state`
    );
    const text = await page.$eval(`${snSelector} .state`, el => el.textContent);
    expect(text).to.equal('1');
  });

  it('useLayout', async () => {
    await page.click(snSelector);
    const text = await page.$eval(`${snSelector} .layout`, el => el.textContent);
    expect(text).to.equal('true');
  });

  it('useTranslator', async () => {
    await page.click(snSelector);
    const text = await page.$eval(`${snSelector} .translator`, el => el.textContent);
    expect(text).to.equal('Cancel');
  });

  it('useTheme', async () => {
    await page.click(snSelector);
    const text = await page.$eval(`${snSelector} .theme`, el => el.textContent);
    expect(text).to.equal('#a54343');
  });
});
