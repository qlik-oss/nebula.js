const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

function snapshotter({ host, port }) {
  const snapshots = {};
  const images = {};

  let browser;

  return {
    addRoutes(app) {
      app.use(
        bodyParser.json({
          limit: '10mb',
        })
      );

      app.get('/image/:id', (req, res) => {
        const p = images[req.params.id];
        if (p) {
          res.contentType('image/png');
          res.end(p, 'binary');
        } else {
          res.sendStatus('404');
        }
      });
      app.post('/image', async (req, res) => {
        let snap;
        try {
          snap = req.body;
          if (!snap.key) {
            snap.key = String(+Date.now());
          }
          snapshots[snap.key] = snap;
        } catch (e) {
          res.sendStatus('400');
        }

        try {
          browser = browser || (await puppeteer.launch());
          const page = await browser.newPage();
          await page.setViewport({
            width: snap.meta.size.width,
            height: snap.meta.size.height,
          });
          await page.goto(`http://${host}:${port}/render?snapshot=${snap.key}`);
          await page.waitFor(
            () =>
              document.querySelector('.nebulajs-sn') &&
              +document.querySelector('.nebulajs-sn').getAttribute('data-render-count') > 0
          );
          const image = await page.screenshot();
          images[snap.key] = image;
          res.send({
            url: `/image/${snap.key}`,
          });
        } catch (e) {
          console.error(e);
          res.sendStatus('503');
        }
      });

      app.post('/snapshot', (req, res) => {
        try {
          const snap = req.body;
          if (!snap.key) {
            snap.key = String(+Date.now());
          }
          snapshots[snap.key] = snap;
          res.json({
            url: `/render?snapshot=${snap.key}`,
          });
        } catch (e) {
          console.error(e);
          res.sendStatus('400');
        }
      });

      app.get('/snapshot/:id', (req, res) => {
        const p = snapshots[req.params.id];
        if (p) {
          res.json(p);
        } else {
          res.sendStatus('404');
        }
      });
    },
  };
}
module.exports = snapshotter;
