/* eslint-disable import/extensions */
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import portfinder from 'portfinder';
import extend from 'extend';
import yargs from 'yargs';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import express from 'express';
import build from '@nebula.js/cli-build';

import initConfig from './init-config.js';
import provided from './provided-modules.js';
import rsbuildServe from './rsbuild.serve.js';

const require = createRequire(import.meta.url);

// the file names of the modules in the urls that the micro frontend tooling asks for, @scope/name is scope-name.js
const getFileName = (name, suffix) => `${name.replace(/^@/, '').replace(/\//g, '-')}${suffix}`;
export const getSystemFileName = (name) => getFileName(name, '.js');
export const getEsmFileName = (name) => getFileName(name, '.esm.js');

// `snPath` is the es module of the visualization and `systemPath` the systemjs module of it
// `snName` is the type of the visualization and `moduleName` the name of the package, which the urls of the modules have
export const initiateWatch = async ({ snPath, snName, moduleName = snName, host, systemPath }) => {
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

  return {
    addRoutes(app, options) {
      // the files of the build are where the build wrote them, the urls are the ones that the micro frontend tooling and
      // the web app ask for
      const modules = [
        [getEsmFileName(moduleName), snPath],
        ...(systemPath ? [[getSystemFileName(moduleName), systemPath]] : []),
      ];
      app.get('/:file', async (req, res, next) => {
        const module = modules.find(([name]) => name === req.params.file);
        if (!module) {
          next();
          return;
        }
        await done;
        if (!fs.existsSync(module[1])) {
          res.sendStatus(404);
          return;
        }
        res.set(options.headers);
        // a module script is only run when the type of it is javascript
        res.type('text/javascript');
        res.send(fs.readFileSync(module[1]));
      });

      // a code split module imports its chunks from `chunks`, relative to the url of the module
      [...new Set(modules.map(([, file]) => path.join(path.dirname(file), 'chunks')))].forEach((dir) => {
        app.use('/chunks', express.static(dir, { setHeaders: (res) => res.set(options.headers) }));
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
    const formats = ['esm', ...(externalPkg.systemjs ? ['systemjs'] : [])];
    if (serveConfig.build !== false) {
      // the formats of one package are built one after the other, to keep the output of the builds apart
      await formats.reduce(async (previous, format) => {
        await previous;
        watchers.push(await build({ watch: format, external: provided, config: serveConfig.config, cwd: context }));
      }, Promise.resolve());
      // build({ watch }) has no watcher when the build is not possible
      watcher = { close: () => Promise.all(watchers.map((w) => w && w.close())) };
    }
    const externalEntry = externalPkg.module;
    if (externalEntry) {
      snName = externalPkg.name;
      snPath = path.resolve(context, externalEntry);
    }
    if (externalPkg.systemjs) {
      systemPath = path.resolve(context, externalPkg.systemjs);
    }
  }

  const ww = snUrl
    ? null
    : await initiateWatch({ snPath, snName: serveConfig.type || snName, moduleName: snName, host, systemPath });

  const server = await rsbuildServe({
    host,
    port,
    disableHostCheck: serveConfig.disableHostCheck,
    enigmaConfig,
    clientId: serveConfig.clientId,
    webIntegrationId: serveConfig.webIntegrationId,
    snName: serveConfig.type || snName,
    snUrl,
    snModule: ww ? `/${getEsmFileName(snName)}` : undefined,
    pages,
    open: serveConfig.open !== false,
    entryWatcher: ww,
    serveConfig,
  });

  if (systemPath) {
    console.log(`SystemJS module served at ${server.url}/${getSystemFileName(snName)}`);
    console.log(`ES module served at ${server.url}/${getEsmFileName(snName)}`);
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
