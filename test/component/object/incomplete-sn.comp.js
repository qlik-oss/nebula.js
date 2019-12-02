describe('sn', () => {
  const selector = '.nebulajs-cell [data-tid="error-title"';
  it('should show incomplete visualization', async () => {
    await page.goto('http://localhost:8000/render/?fixture=./object/incomplete-sn.fix.js&theme=dark');

    await page.waitForSelector(selector, { visible: true });
    const text = await page.$eval(selector, el => el.textContent);
    expect(text).to.equal('Incomplete visualization');
  });
});
