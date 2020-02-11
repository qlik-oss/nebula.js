describe('hooks', () => {
  const snSelector = '.nebulajs-sn';

  before(async () => {
    await page.goto(`${process.env.BASE_URL}/render/?fixture=./hooks/hooked.fix.js`);
    await page.waitForSelector(snSelector, { visible: true });
  });

  it('usePromise', async () => {
    await page.waitForFunction(
      selector => document.querySelector(selector).getAttribute('data-render-count') === '1',
      {},
      `${snSelector}`
    );
    expect(await page.$eval(`${snSelector} .promise`, el => el.textContent)).to.equal('ready!');
  });

  it('should render with initial state', async () => {
    const state = await page.$eval(`${snSelector} .state`, el => el.textContent);
    expect(state).to.equal('0');
    const action = await page.$eval(`${snSelector} .action`, el => el.textContent);
    expect(action).to.equal('false');
  });

  it('should update count state after first click', async () => {
    await page.click(snSelector);
    await page.waitForFunction(
      selector => document.querySelector(selector).textContent === '1',
      {},
      `${snSelector} .state`
    );
    const text = await page.$eval(`${snSelector} .state`, el => el.textContent);
    expect(text).to.equal('1');
  });

  it('should update action state after second click', async () => {
    await page.click(snSelector);
    await page.waitForFunction(
      selector => document.querySelector(selector).textContent === 'true',
      {},
      `${snSelector} .action`
    );
    const text = await page.$eval(`${snSelector} .action`, el => el.textContent);
    expect(text).to.equal('true');
  });

  it('useLayout', async () => {
    const text = await page.$eval(`${snSelector} .layout`, el => el.textContent);
    expect(text).to.equal('true');
  });

  it('useAppLayout', async () => {
    const text = await page.$eval(`${snSelector} .applayout`, el => el.textContent);
    expect(text).to.equal('app-title');
  });

  it('useTranslator', async () => {
    const text = await page.$eval(`${snSelector} .translator`, el => el.textContent);
    expect(text).to.equal('Cancel');
  });

  it('useTheme', async () => {
    const text = await page.$eval(`${snSelector} .theme`, el => el.textContent);
    expect(text).to.equal('#a54343');
  });

  it('useConstraints', async () => {
    const text = await page.$eval(`${snSelector} .constraints`, el => el.textContent);
    expect(text).to.equal('false:false:true');
  });

  it('useOptions', async () => {
    const text = await page.$eval(`${snSelector} .options`, el => el.textContent);
    expect(text).to.equal('opts');
  });
});
