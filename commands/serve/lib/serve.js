/* eslint-disable import/extensions */
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import portfinder from 'portfinder';
import extend from 'extend';
import yargs from 'yargs';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import build from '@nebula.js/cli-build';

import initConfig from './init-config.js';
import provided from './provided-modules.js';
import rsbuildServe from './rsbuild.serve.js';

const require = createRequire(import.meta.url);

// a code split module imports its chunks, and their source maps, from beside the entry
const siblingFile = (snPath, name) => {
  if (path.basename(name) !== name || name === '.' || name === '..') {
    return null;
  }
  const file = path.join(path.dirname(snPath), name);
  return fs.existsSync(file) && fs.statSync(file).isFile() ? file : null;
};

// the file name of the systemjs module in the url that the micro frontend tooling asks for, @scope/name is scope-name.js
export const getSystemFileName = (name) => `${name.replace(/^@/, '').replace(/\//g, '-')}.js`;

// `systemPath` is the systemjs module when `snPath` is the es module of the visualization
export const initiateWatch = async ({ snPath, snName, host, systemPath }) => {
  if (!snPath) {
    return null;
  }
  // TODO - timeout
  let onInitiated;
  const done = new Promise((resolve) => {
    onInitiated = resolve;
  });

  const wsPort = await portfinder.getPortPromise({ port: 5001, host });

  const ws = new WebSocketServer({
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
    [...ws.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          changed: [snName],
        })
      );
    });
  });

  const cache = {};

  const send = (res, file, headers) => {
    if (fs.existsSync(file)) {
      res.set(headers);
      // a module script is only run when the type of it is javascript
      res.type(/\.map$/.test(file) ? 'application/json' : 'text/javascript');
      res.send(fs.readFileSync(file));
    } else {
      res.sendStatus('404');
    }
  };

  return {
    addRoutes(app, options) {
      if (systemPath) {
        // the chunks of a code split systemjs module are loaded relative to the url of the module
        const systemFileName = getSystemFileName(snName);
        app.get('/:file', (req, res, next) => {
          const { file } = req.params;
          const target =
            file === systemFileName ? systemPath : /\.(js|map)$/.test(file) && siblingFile(systemPath, file);
          if (target) {
            send(res, target, options.headers);
          } else {
            next();
          }
        });
      }

      app.get('/pkg/:name', async (req, res) => {
        const { name } = req.params;
        await done;

        const sibling = snPath ? siblingFile(snPath, name) : null;

        let file;
        if (cache[name]) {
          file = cache[name];
        } else if (name === snName) {
          file = snPath;
        } else if (sibling) {
          file = sibling;
        } else if (/\.map$/.test(name)) {
          const sources = Object.keys(cache);
          for (let i = 0; i < sources.length; i++) {
            const p = cache[sources[i]];
            const filename = path.basename(p);
            if (`${filename}.map` === name) {
              file = path.resolve(path.dirname(p), name);
              break;
            }
          }
        } else {
          file = require.resolve(name, {
            paths: [process.cwd()],
          });
        }

        cache[name] = file;

        send(res, file, options.headers);
      });
    },
    async close() {
      await ws.close();
      await choker.close();
    },
    port: wsPort,
  };
};

// `pages` is for developing nebula serve itself, see dev.js: it serves the pages from their source
export default async (argv, { pages } = {}) => {
  let context = process.cwd();
  let defaultServeConfig = {};
  let runFromDirectory = false;

  if (!argv.$0) {
    const yargsArgs = argv.config ? ['--config', argv.config] : [];
    defaultServeConfig = initConfig(yargs(yargsArgs)).argv;
  }

  const serveConfig = extend(true, {}, defaultServeConfig, argv);
  const host = serveConfig.host || 'localhost';
  const port = serveConfig.port || (await portfinder.getPortPromise({ host }));
  const enigmaConfig = serveConfig.enigma;

  let snPath;
  let snName;
  let watcher;
  let snUrl;
  let systemPath;
  const watchers = [];
  if (/^https?/.test(serveConfig.entry)) {
    snName = 'remote';
    snUrl = serveConfig.entry;
  } else if (serveConfig.entry) {
    snPath = path.resolve(context, serveConfig.entry);
    const stat = fs.statSync(snPath);
    if (stat.isDirectory()) {
      runFromDirectory = true;
      context = snPath;
    } else {
      const parsed = path.parse(snPath);
      snName = parsed.name;
    }
  } else {
    runFromDirectory = true;
  }

  if (runFromDirectory) {
    let externalPkg = {};
    try {
      externalPkg = require(path.resolve(context, 'package.json'));
    } catch (e) {
      //
    }
    // the web app loads the es module, the micro frontend tooling loads the systemjs module, so both are served
    // unless it is the micro frontend mode, which does not have the web app
    const formats = serveConfig.mfe ? ['systemjs'] : ['esm', ...(externalPkg.systemjs ? ['systemjs'] : [])];
    if (serveConfig.build !== false) {
      // the formats of one package are built one after the other, to keep the output of the builds apart
      await formats.reduce(async (previous, format) => {
        await previous;
        watchers.push(await build({ watch: format, external: provided, config: serveConfig.config, cwd: context }));
      }, Promise.resolve());
      // build({ watch }) has no watcher when the build is not possible
      watcher = { close: () => Promise.all(watchers.map((w) => w && w.close())) };
    }
    const externalEntry = serveConfig.mfe ? externalPkg.systemjs : externalPkg.module;
    if (externalEntry) {
      snName = externalPkg.name;
      snPath = path.resolve(context, externalEntry);
    }
    if (externalPkg.systemjs) {
      systemPath = path.resolve(context, externalPkg.systemjs);
    }
  }

  const ww = snUrl ? null : await initiateWatch({ snPath, snName: serveConfig.type || snName, host, systemPath });

  const server = await rsbuildServe({
    host,
    port,
    disableHostCheck: serveConfig.disableHostCheck,
    enigmaConfig,
    clientId: serveConfig.clientId,
    webIntegrationId: serveConfig.webIntegrationId,
    snName: serveConfig.type || snName,
    snUrl,
    pages,
    open: serveConfig.open !== false && !serveConfig.mfe,
    entryWatcher: ww,
    serveConfig,
  });

  if (systemPath) {
    console.log(`SystemJS module served at ${server.url}/${getSystemFileName(serveConfig.type || snName)}`);
  }

  const close = async () => {
    if (watcher) {
      watcher.close();
    }
    if (ww) {
      await ww.close();
    }
    server.close();
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, close);
  });

  return {
    url: server.url,
    close,
  };
};
