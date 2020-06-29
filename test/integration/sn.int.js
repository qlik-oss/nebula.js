describe('Simple visualization', () => {
  const content = '.simple-viz';

  describe('basic', () => {
    before(async () => {
      const app = encodeURIComponent(process.env.APP_ID || '/apps/ctrl00.qvf');
      await page.goto(`${process.env.BASE_URL}/render/?app=${app}`);

      await page.waitForSelector(content, { visible: true });
    });

    it('should say hello', async () => {
      const text = await page.$eval('.hello', (el) => el.textContent);
      expect(text).to.equal('Hello engine!');
    });

    it('should be able to load json file', async () => {
      const text = await page.$eval('.json-value', (el) => el.textContent);
      expect(text).to.equal('Hi json!');
    });

    it('should be able to load css', async () => {
      const bg = await page.$eval('.hello', (el) => window.getComputedStyle(el).backgroundColor);
      expect(bg).to.equal('rgb(144, 41, 140)');
    });

    it('should have a dynamically calculated lavout value', async () => {
      const text = await page.$eval('.layout-value', (el) => el.textContent);
      expect(text).to.equal('3');
    });
  });
});
