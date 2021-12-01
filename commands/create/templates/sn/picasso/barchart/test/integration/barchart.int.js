describe('barchart', () => {
  const content = '.njs-viz[data-render-count="1"]';

  it('should have 20 bars', async () => {
    await page.goto(`${process.env.BASE_URL}/render?fixture=scenario-1.fix.js`);
    await page.waitForSelector(content, { visible: true });
    const rects = await page.$$('rect[data-label]');
    expect(rects.length).to.equal(20);
  });
});
