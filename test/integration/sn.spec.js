describe('sn', () => {
  const content = '.nucleus-content__body';
  it('should say hello', async () => {
    const app = encodeURIComponent(process.env.APP_ID || '/apps/ctrl00.qvf');
    await page.goto(`${process.testServer.url}/render/app/${app}`);
    await page.waitForSelector(content, {
      timeout: 5000,
    });
    const text = await page.$eval(content, el => el.textContent);
    expect(text).to.equal('Hello engine!');
  });
});
