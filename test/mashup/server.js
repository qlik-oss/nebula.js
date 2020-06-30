const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const yargs = require('yargs/yargs');

module.exports = async () => {
  let server;
  let snapshooter;
  const app = express();
  const port = 8050;

  const url = `http://localhost:${port}`;

  const args = yargs(process.argv.slice(2)).argv;

  // eslint-disable-next-line
  snapshooter = require('@nebula.js/cli-serve/lib/snapshot-server')({
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

  app.post('/njs/capture', async (req, res) => {
    try {
      const key = await snapshooter.captureImageOfSnapshot(req.body);
      res.send({
        url: `/njs/image/${key}`,
      });
    } catch (e) {
      console.error(e);
      res.sendStatus('500');
    }
  });

  app.get('/njs/snapshot/:id', (req, res) => {
    const p = snapshooter.getStoredSnapshot(req.params.id);
    if (p) {
      res.json(p);
    } else {
      res.sendStatus('404');
    }
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
