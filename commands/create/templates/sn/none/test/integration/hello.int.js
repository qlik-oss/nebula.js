describe('sn', () => {
  const content = '.njs-viz[data-render-count="1"]';
  it('should say hello', async () => {
    const app = encodeURIComponent(process.env.APP_ID || '/apps/ctrl00.qvf');
    await page.goto(`${process.env.BASE_URL}/render/?app=${app}`);
    await page.waitForSelector(content, { visible: true });
    const text = await page.$eval(content, (el) => el.textContent);
    expect(text).to.equal('Hello!');
  });
});
