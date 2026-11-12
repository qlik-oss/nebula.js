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

// A file of the build is served at its path in the package, so that what a module imports by a relative url, such as the
// chunks and the source maps, is served too. A file that is not in the package is served from the root.
export const getUrlPath = (root, file) => {
  const relative = path.relative(root, file);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
    ? `/${relative.split(path.sep).join('/')}`
    : `/${path.basename(file)}`;
};

// `snPath` is the es module of the visualization and `systemPath` the systemjs module of it, `root` is the package
export const initiateWatch = async ({ snPath, snName, host, systemPath, root = process.cwd() }) => {
  if (!snPath) {
    return null;
  }

  const wsPort = await portfinder.getPortPromise({ port: 5001, host });

  const ws = new WebSocketServer({
    port: wsPort,
    clientTracking: true,
  });

  const choker = chokidar.watch(snPath, {
    ignoreInitial: false,
    disableGlobbing: true,
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
      // the directories that nebula build writes to are served as they are
      [...new Set([snPath, systemPath].filter(Boolean).map((file) => path.dirname(file)))].forEach((dir) => {
        const urlPath = path.posix.dirname(getUrlPath(root, path.join(dir, 'file')));
        app.use(urlPath, express.static(dir, { setHeaders: (res) => res.set(options.headers) }));
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
    : await initiateWatch({ snPath, snName: serveConfig.type || snName, host, systemPath, root: context });

  const server = await rsbuildServe({
    host,
    port,
    disableHostCheck: serveConfig.disableHostCheck,
    enigmaConfig,
    clientId: serveConfig.clientId,
    webIntegrationId: serveConfig.webIntegrationId,
    snName: serveConfig.type || snName,
    snUrl,
    snModule: ww ? getUrlPath(context, snPath) : undefined,
    pages,
    open: serveConfig.open !== false,
    entryWatcher: ww,
    serveConfig,
  });

  if (systemPath) {
    console.log(`SystemJS module served at ${server.url}${getUrlPath(context, systemPath)}`);
    console.log(`ES module served at ${server.url}${getUrlPath(context, snPath)}`);
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
