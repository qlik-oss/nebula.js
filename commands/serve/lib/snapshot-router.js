const express = require('express');
const bodyParser = require('body-parser');

module.exports = function router({ base, snapshotUrl, snapshooter }) {
  const r = express.Router();

  r.use(
    bodyParser.json({
      limit: '10mb',
    })
  );

  // returns an existing image
  r.get('/image/:id', (req, res) => {
    const p = snapshooter.getStoredImage(req.params.id);
    if (p) {
      res.contentType('image/png');
      res.end(p, 'binary');
    } else {
      res.sendStatus('404');
    }
  });

  r.post('/capture', async (req, res) => {
    try {
      const key = await snapshooter.captureImageOfSnapshot(req.body);
      res.send({
        url: `${base}/image/${key}`,
      });
    } catch (e) {
      console.error(e);
      res.sendStatus('500');
    }
  });

  // post snapshot
  r.post('/snapshot', (req, res) => {
    const key = snapshooter.storeSnapshot(req.body);
    res.json({
      url: `${snapshotUrl}?snapshot=${key}`,
    });
  });

  r.get('/snapshot/:id', (req, res) => {
    const p = snapshooter.getStoredSnapshot(req.params.id);
    if (p) {
      res.json(p);
    } else {
      res.sendStatus('404');
    }
  });

  r.get('/snapshots', (req, res) => {
    res.json(snapshooter.getStoredSnapshots());
  });

  return r;
};
