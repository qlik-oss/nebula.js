const path = require('path');
const fs = require('fs');
const portfinder = require('portfinder');
const extend = require('extend');
const yargs = require('yargs');
const WebSocket = require('ws').Server;
const chokidar = require('chokidar');
const build = require('@nebula.js/cli-build');

const initConfig = require('./init-config');

const webpackServe = require('./webpack.serve.js');
const useEngine = require('./engine');

const initiateWatch = async ({ snPath, snName, host }) => {
  // TODO - timeout
  let onInitiated;
  const done = new Promise(resolve => {
    onInitiated = resolve;
  });

  const wsPort = await portfinder.getPortPromise({ port: 5001, host });

  const ws = new WebSocket({
    port: wsPort,
    clientTracking: true,
  });

  const choker = chokidar.watch(snPath, {
    ignoreInitial: false,
    disableGlobbing: true,
  });

  choker.on('add', () => {
    onInitiated();
  });

  choker.on('change', () => {
    [...ws.clients].forEach(client => {
      client.send(
        JSON.stringify({
          changed: [snName],
        })
      );
    });
  });

  return {
    addRoutes(app) {
      const baseDir = path.dirname(snPath);

      app.get('/pkg/:name', async (req, res) => {
        const { name } = req.params;
        await done;
        const file = name === snName ? snPath : path.resolve(baseDir, name);
        if (fs.existsSync(file)) {
          const f = fs.readFileSync(file);
          res.send(f);
        } else {
          res.sendStatus('404');
        }
      });
    },
    async close() {
      await ws.close();
      await choker.close();
    },
    port: wsPort,
  };
};

module.exports = async argv => {
  const context = process.cwd();
  let defaultServeConfig = {};

  if (!argv.$0) {
    defaultServeConfig = initConfig(yargs([])).argv;
  }

  const serveConfig = extend(true, {}, defaultServeConfig, argv);

  let stopEngine = () => {};
  if (serveConfig.ACCEPT_EULA) {
    stopEngine = await useEngine(serveConfig);
  }
  const host = serveConfig.host || 'localhost';
  const port = serveConfig.port || (await portfinder.getPortPromise({ host }));
  const enigmaConfig = serveConfig.enigma;

  let snPath;
  let snName;
  let watcher;
  let snUrl;
  if (/^https?/.test(serveConfig.entry)) {
    snName = 'remote';
    snUrl = serveConfig.entry;
  } else if (serveConfig.entry) {
    snPath = path.resolve(context, serveConfig.entry);
    const parsed = path.parse(snPath);
    snName = parsed.name;
  } else {
    if (serveConfig.build !== false) {
      watcher = await build({
        watch: true,
        config: serveConfig.config,
      });
    }
    try {
      const externalPkg = require(path.resolve(context, 'package.json')); // eslint-disable-line global-require
      const externalEntry = externalPkg.main;
      snName = externalPkg.name;
      snPath = path.resolve(context, externalEntry);
    } catch (e) {
      //
    }
  }

  const ww = snUrl ? null : await initiateWatch({ snPath, snName: serveConfig.type || snName, host });

  const server = await webpackServe({
    host,
    port,
    enigmaConfig,
    webIntegrationId: serveConfig.webIntegrationId,
    snName: serveConfig.type || snName,
    snUrl,
    dev: process.env.MONO === 'true',
    open: serveConfig.open !== false,
    entryWatcher: ww,
    watcher,
    serveConfig,
  });

  const close = async () => {
    await stopEngine();
    if (watcher) {
      watcher.close();
    }
    await ww.close();
    server.close();
  };

  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, close);
  });

  // eslint-disable-next-line consistent-return
  return {
    url: server.url,
    close,
  };
};
