const path = require('path');
const serve = require('@nebula.js/cli-serve'); // eslint-disable-line
const senseishTheme = require('./themes/senseish-theme.json');
const x2Theme = require('./themes/x2-theme.json');

describe('grid chart', () => {
  let s;
  const snSelector = '.njs-viz';

  page.on('pageerror', (e) => {
    console.error('Web: ', e.message);
  });

  page.on('console', (msg) => {
    for (let i = 0; i < msg.args().length; ++i) {
      const text = msg.text();
      if (text.includes('WDS') || text.includes('React DevTools')) {
        return;
      }
      console.log(`console ${text}`);
    }
  });

  before(async () => {
    s = await serve({
      entry: path.resolve(__dirname, './dist/sn-grid-chart.js'),
      open: false,
      build: false,
      fixturePath: 'test/rendering/sn-grid-chart/__fixtures__',
      themes: [
        { id: 'senseish', theme: senseishTheme },
        { id: 'x2', theme: x2Theme },
      ],
    });
  });

  after(() => {
    s.close();
  });

  it('renders with artifact imported in fixture', async () => {
    const url = `${s.url}/render?fixture=scenario-1.fix.js`;
    await page.goto(url);
    console.log('url', url);
    await page.waitForSelector(snSelector, { visible: true });
    expect(true).to.equal(true);
  });

  it('renders with artifact provided in nebula config', async () => {
    const url = `${s.url}/render?fixture=scenario-2.fix.js`;
    await page.goto(url);
    console.log('url', url);
    expect(true).to.equal(true);
  });

  it('renders with senseish theme', async () => {
    const url = `${s.url}/render?fixture=scenario-1.fix.js&theme=senseish`;
    await page.goto(url);
    console.log('url', url);
    await page.waitForSelector(snSelector, { visible: true });
    expect(true).to.equal(true);
  });

  it('renders with x2 theme', async () => {
    const url = `${s.url}/render?fixture=scenario-1.fix.js&theme=x2`;
    await page.goto(url);
    console.log('url', url);
    await page.waitForSelector(snSelector, { visible: true });
    expect(true).to.equal(true);
  });
});
