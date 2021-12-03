describe('sn', () => {
  const content = '.njs-viz[data-render-count="1"]';
  it('should say hello', async () => {
    const url = `${process.env.BASE_URL}/render?fixture=hello.fix.js`;
    await page.goto(url);
    await page.waitForSelector(content, { visible: true });
    const text = await page.$eval(content, (el) => el.textContent);
    expect(text).to.equal('Hello!');
  });
});
