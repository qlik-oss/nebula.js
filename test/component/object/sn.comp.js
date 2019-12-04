describe('sn', () => {
  const selector = '.nebulajs-sn';
  it('should render with translation', async () => {
    await page.goto('http://localhost:8000/render/?fixture=./object/sn.fix.js&language=sv-SE');

    await page.waitForSelector(selector, { visible: true });
    const text = await page.$eval(selector, el => el.textContent);
    expect(text).to.equal('Hej motor!');
  });
});
