const path = require('path');
const jimp = require('jimp');

const differ = () => {
  const artifacts = path.resolve(__dirname, '../__artifacts__/');

  return {
    async looksLike(name, captured) {
      const file = `${path.basename(__dirname)}-${name}`;
      const stored = await jimp.read(path.resolve(artifacts, 'baseline', file));
      const distance = jimp.distance(stored, captured);
      const diff = jimp.diff(stored, captured);
      if (distance > 0.001 || diff.percent > 0.001) {
        await captured.writeAsync(path.resolve(artifacts, 'regression', file));
        await diff.image.writeAsync(path.resolve(artifacts, 'diff', file));
        throw new Error(`Images differ too much - distance: ${distance}, percent: ${diff.percent}`);
      }
    },
  };
};

const d = differ();

describe('snapper', () => {
  const object = '[data-type="bar"]';
  const selector = `${object} .njs-viz`;
  it('should capture an image of a bar', async () => {
    await page.goto(`${process.env.BASE_URL}/snaps/snapper.html`);

    await page.waitForSelector(selector, { visible: true });
    await page.click(selector);
    await page.waitForSelector(`${object}[data-captured]`, { visible: true });
    const imgSrc = await page.$eval(`${object}[data-captured]`, (el) => el.getAttribute('data-captured'));

    const captured = await jimp.read(`${process.env.BASE_URL}${imgSrc}`);
    await d.looksLike('bar.png', captured);
  });
});
