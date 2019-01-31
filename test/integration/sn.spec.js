const path = require('path');

describe('sn', () => {
  const content = '.nucleus-content__body';
  it('should say hello', async () => {
    await page.goto(`file://${path.resolve(__dirname, '../__serve__/index.html')}`);
    await page.waitForSelector(content, {
      timeout: 5000,
    });
    const text = await page.$eval(content, el => el.textContent);
    expect(text).to.equal('Hello!');
  });
});
