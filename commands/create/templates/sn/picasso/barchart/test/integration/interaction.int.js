describe('interaction', () => {
  const content = '.njs-viz[data-render-count="1"]';
  it('should select two bars', async () => {
    const app = encodeURIComponent(process.env.APP_ID || '/apps/ctrl00.qvf');
    console.log('START');
    await page.goto(`${process.env.BASE_URL}/render/?app=${app}&cols=Alpha,=5+avg(Expression1)`);
    console.log('1');
    await page.waitForSelector(content, { visible: true });
    console.log('2');
    await page.click('rect[data-label="K"]');
    console.log('3');
    await page.click('rect[data-label="S"]');
    console.log('4');
    await page.waitForSelector('button[title="Confirm selection"]:not([disabled])', { visible: true });
    console.log('5');
    await page.click('button[title="Confirm selection"]');
    console.log('6');

    await page.waitForFunction((selector) => document.querySelectorAll(selector).length === 2, {}, 'rect[data-label]');
    console.log('7');
    const rects = await page.$$eval('rect[data-label]', (sel) => sel.map((r) => r.getAttribute('data-label')));
    console.log('8');
    expect(rects).to.eql(['K', 'S']);
  });
});
