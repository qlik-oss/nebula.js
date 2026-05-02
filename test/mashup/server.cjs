const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const yargs = require('yargs/yargs');

module.exports = async () => {
  let server;
  const app = express();
  const port = 8050;
  const withErrorHandling = (handler) => (req, res, next) =>
    Promise.resolve()
      .then(() => handler(req, res, next))
      .catch(next);

  const url = `http://localhost:${port}`;

  const args = yargs(process.argv.slice(2)).argv;

  const { default: createSnapshooter } = await import('@nebula.js/cli-serve/lib/snapshot-server');
  const snapshooter = createSnapshooter({
    snapshotUrl: `${url}/snaps/single.html`,
    chrome: args.chrome || {},
  });

  app.use(express.static(path.resolve(__dirname)));
  app.use('/apis', express.static(path.resolve(__dirname, '../../apis')));
  app.use('/fixtures', express.static(path.resolve(__dirname, '../fixtures')));
  app.use('/node_modules', express.static(path.resolve(__dirname, '../../node_modules')));

  app.use(
    bodyParser.json({
      limit: '10mb',
    })
  );

  app.get('/njs/image/:id', (req, res) => {
    const p = snapshooter.getStoredImage(req.params.id);
    if (p) {
      res.contentType('image/png');
      res.end(p, 'binary');
    } else {
      res.sendStatus('404');
    }
  });

  app.post(
    '/njs/capture',
    withErrorHandling(async (req, res) => {
      const key = await snapshooter.captureImageOfSnapshot(req.body);
      res.send({
        url: `/njs/image/${key}`,
      });
    })
  );

  app.get('/njs/snapshot/:id', (req, res) => {
    const p = snapshooter.getStoredSnapshot(req.params.id);
    if (p) {
      res.json(p);
    } else {
      res.sendStatus('404');
    }
  });

  app.use((err, req, res, next) => {
    console.error(`Mashup server error on ${req.method} ${req.url}:`, err);

    if (res.headersSent) {
      return next(err);
    }

    res.sendStatus(500);
  });

  await new Promise((resolve) => {
    server = app.listen(port, () => {
      console.log(`Running mashup server at localhost:${port}`);
      resolve();
    });
  });

  return {
    url,
    async close() {
      server.close();
      await snapshooter.close();
    },
  };
};
