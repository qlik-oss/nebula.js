const fs = require('fs');
const express = require('express');

module.exports = function router() {
  const r = express.Router();

  // r.use((req, _, next) => {
  //   console.log(`${req.method} - ${req.originalUrl}`);
  //   next();
  // });

  r.get('/loadScript', (req, res) => {
    const { path } = req.query;
    try {
      if (!path.endsWith('.js')) {
        res.status(400).json({ error: 'Specify a file with extension ".js"' });
        return;
      }
      if (fs.existsSync(path)) {
        const fixture = fs.readFileSync(path);
        res.type('js');
        res.send(fixture);
        res.end();
      } else {
        res.sendStatus(404);
      }
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
    }
  });

  r.get('/loadJson', (req, res) => {
    const { path } = req.query;
    try {
      if (!path.endsWith('.json')) {
        res.status(400).json({ error: 'Specify a file with extension ".json"' });
        return;
      }
      if (fs.existsSync(path)) {
        const fixture = fs.readFileSync(path);
        res.json(JSON.parse(fixture));
      } else {
        res.sendStatus(404);
      }
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
    }
  });

  return r;
};
