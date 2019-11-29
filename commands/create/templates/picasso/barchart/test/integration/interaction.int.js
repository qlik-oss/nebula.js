describe('interaction', () => {
  const content = '.nebulajs-sn';
  it('should select two bars', async () => {
    const app = encodeURIComponent(process.env.APP_ID || '/apps/ctrl00.qvf');
    await page.goto(
      `${process.env.BASE_URL}/render/app/${app}?cols=Alpha,=5+avg(Expression1)&&permissions=interact,select`
    );
    await page.waitForSelector(content, { visible: true });

    await page.click('rect[data-label="K"]');
    await page.click('rect[data-label="S"]');

    await page.waitForSelector('button[title="Confirm selection"]');
    await page.click('button[title="Confirm selection"]');

    await page.waitForFunction(selector => document.querySelectorAll(selector).length === 2, {}, 'rect[data-label]');

    const rects = await page.$$eval('rect[data-label]', sel => sel.map(r => r.getAttribute('data-label')));
    expect(rects).to.eql(['K', 'S']);
  });
});
