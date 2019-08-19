describe('interaction', () => {
  const content = '.nebulajs-sn';
  it('should select two bars', async () => {
    const app = encodeURIComponent(process.env.APP_ID || '/apps/ctrl00.qvf');
    await page.goto(`${process.testServer.url}/render/app/${app}?cols=Alpha,=5+avg(Expression1)&&permissions=interact,select`);
    await page.waitForFunction(`!!document.querySelector('${content}')`);

    await page.click('rect[data-label="K"]');
    await page.click('rect[data-label="S"]');
    await page.click('button[title="Confirm selection"]');

    const rects = await page.$$eval('rect[data-label]', (sel) => sel.map((r) => r.getAttribute('data-label')));
    expect(rects).to.eql(['K', 'S']);
  });
});
