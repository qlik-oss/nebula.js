describe('interaction', () => {
  const content = '.njs-viz[data-render-count="1"]';
  it('should select two bars', async () => {
    const app = encodeURIComponent(process.env.APP_ID || '/apps/ctrl00.qvf');
    console.log('a');
    await page.goto(`${process.env.BASE_URL}/render/?app=${app}&cols=Alpha,=5+avg(Expression1)`);
    console.log('b');
    await page.waitForSelector(content, { visible: true });

    console.log('c');
    await page.click('rect[data-label="K"]');
    console.log('d');
    await page.click('rect[data-label="S"]');

    console.log('e');
    await page.waitForSelector('button[title="Confirm selection"]:not([disabled])', { visible: true });
    console.log('f');
    await page.click('button[title="Confirm selection"]');

    console.log('g');
    await page.waitForFunction((selector) => document.querySelectorAll(selector).length === 2, {}, 'rect[data-label]');

    console.log('h');
    const rects = await page.$$eval('rect[data-label]', (sel) => sel.map((r) => r.getAttribute('data-label')));
    expect(rects).to.eql(['K', 'S']);
  });
});
