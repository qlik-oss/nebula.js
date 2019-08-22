describe('sn', () => {
  const content = '.nebulajs-sn';
  it('should say hello', async () => {
    const app = encodeURIComponent(process.env.APP_ID || '/apps/ctrl00.qvf');
    await page.goto(`${process.testServer.url}/render/app/${app}`);

    await page.waitForFunction(`!!document.querySelector('${content}')`); // seems to be an issue using .waitForSelector when running on circle
    const text = await page.$eval(content, el => el.textContent);
    expect(text).to.equal('Hello engine!');
  });
});
