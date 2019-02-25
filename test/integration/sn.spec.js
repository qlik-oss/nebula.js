describe('sn', () => {
  const content = '.nucleus-content__body';
  it('should say hello', async () => {
    await page.goto(process.testServer.url);
    await page.waitForSelector(content, {
      timeout: 5000,
    });
    const text = await page.$eval(content, el => el.textContent);
    expect(text).to.equal('Hello!');
  });
});
