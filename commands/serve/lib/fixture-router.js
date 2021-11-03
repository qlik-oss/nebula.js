const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const fixtureServer = require('./fixture-server');

const getFixtureUrlInfo = ({ host, port }) => {
  const baseUrl = `http://${host}:${port}`;

  return {
    get(key) {
      return {
        __meta__: {
          detailsUrl: `${baseUrl}/fixture/${key}`,
          renderUrl: `${baseUrl}/render?fixture=${key}`,
        },
      };
    },
    decorate(...fixtures) {
      return fixtures.map((fixture) => ({ ...fixture, ...this.get(fixture.key) }));
    },
  };
};

module.exports = function router({ host, port }) {
  const r = express.Router();
  const fixtureUrls = getFixtureUrlInfo({ host, port });

  r.use(
    bodyParser.json({
      limit: '10mb',
    })
  );

  // r.use((req, _, next) => {
  //   console.log(`${req.method} - ${req.originalUrl}`);
  //   next();
  // });

  r.post('/', (req, res) => {
    try {
      const key = fixtureServer.storeFixture(req.body);
      res.send(fixtureUrls.get(key));
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
    }
  });

  r.get('/', async (req, res) => {
    res.send({ data: fixtureUrls.decorate(fixtureServer.getFixtures()) });
  });

  r.get('/fromFile', (req, res) => {
    const { path } = req.query;
    if (fs.existsSync(path)) {
      const fixture = JSON.parse(fs.readFileSync(path));
      res.json(fixture);
    } else {
      res.sendStatus(404);
    }
  });

  r.get('/:key', (req, res) => {
    const fixture = fixtureServer.getFixture(req.params.key);
    if (fixture) {
      res.json(fixtureUrls.decorate(fixture)[0]);
    } else {
      res.sendStatus('404');
    }
  });

  return r;
};
