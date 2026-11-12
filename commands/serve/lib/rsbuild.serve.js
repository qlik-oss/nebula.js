/* eslint-disable no-console */
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import express from 'express';
import { createRsbuild } from '@rsbuild/core';

import snapshooterFn from './snapshot-server.js';
import snapshotRouter from './snapshot-router.js';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const homeDir = homedir();

const httpsKeyPath = path.join(homeDir, '.certs/key.pem');
const httpsCertPath = path.join(homeDir, '.certs/cert.pem');

const HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'x-qlik-xrfkey,qlik-csrf-token',
};

const BANNER = `
     _  _________  __  ____   ___
    / |/ / __/ _ )/ / / / /  / _ |
   /    / _// _  / /_/ / /__/ __ |
  /_/|_/___/____/\\____/____/_/ |_|
      / __/ __/ _ \\ | / / __/
     _\\ \\/ _// , _/ |/ / _/
    /___/___/_/|_||___/___/
         `;

const styledBanner = () =>
  BANNER.split('\n')
    .map((line) => {
      const trimmedLine = line.trimEnd();
      if (!trimmedLine) {
        return '';
      }

      const leadingWhitespace = trimmedLine.match(/^\s*/)[0];
      const art = trimmedLine.slice(leadingWhitespace.length);
      // Brand color for the nebula serve startup banner
      return `${leadingWhitespace}${chalk.bgHex('#32e1ee').white(art)}`;
    })
    .join('\n');

// the pages as they are built with the package, and the fixtures of the project built when serve starts
const publishedPages = async ({ serveConfig }) => {
  const prodConfig = (await import('./rsbuild.prod.js')).default;
  const srcDir = path.resolve(moduleDir, '../dist');
  return { config: prodConfig({ srcDir, serveConfig }), contentBase: srcDir };
};

/**
 * @param {object} options
 * @param {function} [options.pages] Gives the config of Rsbuild for the pages, the folder that serves them and if they
 * reload on a change: `({ serveConfig }) => ({ config, contentBase, hmr })`. The pages that the package was built with
 * are served unless this is given, which `pnpm start` of this package does to serve them from source.
 */
export default async ({
  host,
  port,
  disableHostCheck,
  enigmaConfig,
  clientId,
  webIntegrationId,
  snName,
  snUrl,
  pages = publishedPages,
  open = true,
  entryWatcher,
  serveConfig,
}) => {
  const HTTPS = serveConfig.https;
  const url = `${HTTPS ? 'https' : 'http'}://${host}:${port}`;

  if (HTTPS) {
    if (!fs.existsSync(httpsKeyPath)) {
      throw new Error(`Failed to start using HTTPS. Missing key cert at path ${httpsKeyPath}`);
    }
    if (!fs.existsSync(httpsCertPath)) {
      throw new Error(`Failed to start using HTTPS. Missing cert at path ${httpsCertPath}`);
    }
  }

  const snapshotRoute = '/njs';

  const snapshooter = snapshooterFn({ snapshotUrl: `${url}/eRender.html` });

  (serveConfig.snapshots || []).forEach((s) => {
    snapshooter.storeSnapshot(s);
  });

  const snapRouter = snapshotRouter({
    base: `${url}${snapshotRoute}`,
    snapshotUrl: `${url}/eRender.html`,
    snapshooter,
  });

  const themes = serveConfig.themes || [];
  const renderConfigs = serveConfig.renderConfigs || [];

  const { config, contentBase, hmr = false } = await pages({ serveConfig });

  const app = express();
  app.use((req, res, next) => {
    res.set(HEADERS);
    next();
  });

  app.use(snapshotRoute, snapRouter);

  if (entryWatcher) {
    entryWatcher.addRoutes(app, { headers: HEADERS });
  }

  app.get('/themes', (req, res) => {
    const arr = themes.map((theme) => theme.id);
    res.json(arr);
  });

  app.get('/theme/:id', (req, res) => {
    const t = themes.filter((theme) => theme.id === req.params.id)[0];
    if (!t) {
      res.sendStatus('404');
    } else {
      res.json(t.theme);
    }
  });

  app.get('/render-configs', (_, res) => {
    res.json(renderConfigs);
  });

  app.get('/render-config/:id', (req, res) => {
    const renderConfig = renderConfigs.filter((r) => r.id === req.params.id)[0];
    if (!renderConfig) {
      res.sendStatus('404');
    } else {
      res.json(renderConfig.render);
    }
  });

  app.get('/info', (req, res) => {
    res.json({
      engine: enigmaConfig,
      clientId,
      webIntegrationId,
      isClientIdProvided: Boolean(clientId),
      isWebIntegrationIdProvided: Boolean(webIntegrationId),
      supernova: {
        name: snName,
        url: snUrl,
      },
      sock: {
        port: entryWatcher && entryWatcher.port,
      },
      flags: serveConfig.flags,
      anything: serveConfig.anything,
      themes: themes.map((theme) => theme.id),
      types: serveConfig.types,
      keyboardNavigation: serveConfig.keyboardNavigation,
    });
  });

  if (serveConfig.resources) {
    app.use('/resources', express.static(serveConfig.resources));
  }

  app.use('/assets', express.static(path.resolve(moduleDir, '../assets')));

  const rsbuild = await createRsbuild({
    cwd: contentBase,
    config: {
      ...config,
      dev: {
        hmr,
        // the output of the build is served from memory and never written to the disk
        writeToDisk: false,
      },
      server: {
        middlewareMode: true,
        host,
        port,
        allowedHosts: disableHostCheck ? true : undefined,
        headers: HEADERS,
        open: Boolean(open),
        publicDir: { name: contentBase, copyOnBuild: false },
        proxy: {
          '/render': {
            target: `${url}/eRender.html`,
            ignorePath: true,
          },
        },
      },
    },
  });

  const devServer = await rsbuild.createDevServer({ getPortSilently: true });
  app.use(devServer.middlewares);

  // The hub is served for all paths that ask for a page: @qlik/api detects the authorization code of the OAuth2
  // callback at /auth/login/callback in the URL, to complete the token exchange in the page
  app.use((req, res, next) => {
    if (req.method === 'GET' && !path.extname(req.path) && req.accepts('html')) {
      // the folder is the root, a path with a segment that starts with a dot, such as .pnpm, is not sent otherwise
      res.sendFile('index.html', { root: contentBase });
    } else {
      next();
    }
  });

  const httpServer = HTTPS
    ? https.createServer({ key: fs.readFileSync(httpsKeyPath), cert: fs.readFileSync(httpsCertPath) }, app)
    : http.createServer(app);

  const close = async () => {
    await devServer.close();
    httpServer.close();
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, close);
  });

  const started = () => {
    console.log(styledBanner());

    console.log(`Development server running at ${chalk.green(url)}`);

    return { context: '', url, close };
  };

  return new Promise((resolve, reject) => {
    let initiated = false;
    const start = async (stats) => {
      if (initiated) {
        return;
      }
      initiated = true;
      const result = started();
      resolve(result);
      if (stats && stats.hasErrors()) {
        stats.toJson({ all: false, errors: true }).errors.forEach((e) => {
          console.log(chalk.red(e.message));
        });
        process.exit(1);
      }
    };

    rsbuild.onDevCompileDone(({ stats }) => start(stats));

    httpServer.on('error', reject);
    httpServer.listen(port, host, async () => {
      devServer.connectWebSocket({ server: httpServer });
      await devServer.afterListen();
    });
  });
};
