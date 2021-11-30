describe('bar chart', () => {
  const snSelector = '.njs-viz';

  it('renders', async () => {
    const url = `${process.env.BASE_URL}/render?fixture=./barchart/barchart.fix.js`;
    await page.goto(url);
    await page.waitForSelector(snSelector, { visible: true });
    await page.waitForFunction(
      (selector) => document.querySelector(selector).getAttribute('data-render-count') === '1',
      {},
      `${snSelector}`
    );
  });
});
