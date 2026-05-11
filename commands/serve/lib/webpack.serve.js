/* eslint-disable no-console, import/extensions */
import path from 'path';
import fs from 'fs';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import express from 'express';

import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import snapshooterFn from './snapshot-server.js';
import snapshotRouter from './snapshot-router.js';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const homeDir = homedir();

const httpsKeyPath = path.join(homeDir, '.certs/key.pem');
const httpsCertPath = path.join(homeDir, '.certs/cert.pem');

export default async ({
  host,
  port,
  disableHostCheck,
  enigmaConfig,
  clientId,
  webIntegrationId,
  snName,
  snUrl,
  dev = false,
  open = true,
  entryWatcher,
  watcher,
  serveConfig,
}) => {
  let config;
  let contentBase;
  const HTTPS = serveConfig.mfe || serveConfig.https;
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

  if (dev) {
    const webpackConfig = (await import('./webpack.build.js')).default;
    const srcDir = path.resolve(moduleDir, '../web');
    const distDir = path.resolve(srcDir, '../dist');
    contentBase = distDir;
    config = webpackConfig({
      srcDir,
      distDir,
      dev: true,
      serveConfig,
    });
  } else {
    const webpackConfig = (await import('./webpack.prod.js')).default;
    const srcDir = path.resolve(moduleDir, '../dist');
    contentBase = srcDir;
    config = webpackConfig({
      srcDir,
      serveConfig,
    });
  }
  const options = {
    client: {
      logging: 'none',
      overlay: {
        warnings: false,
        errors: true,
      },
      progress: true,
    },
    hot: dev,
    host,
    port,
    allowedHosts: disableHostCheck ? 'all' : 'auto',
    open,
    // NOTE: historyApiFallback intentionally handles the @qlik/api OAuth2 callback at
    // /auth/login/callback — the SPA is served for all paths and @qlik/api detects
    // the authorization code in the URL to complete the token exchange client-side.
    historyApiFallback: true,
    // Disable nebula serve dev env when in MFE mode
    static: !serveConfig.mfe && {
      directory: contentBase,
      watch: {
        ignored: /node_modules/,
      },
    },
    setupMiddlewares(middlewares, devServer) {
      const { app } = devServer;

      app.use(snapshotRoute, snapRouter);

      if (entryWatcher) {
        entryWatcher.addRoutes(app, devServer.options);
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
        res.set(devServer.options.headers);
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
      return middlewares;
    },
    proxy: [
      {
        context: '/render',
        target: `${url}/eRender.html`,
        ignorePath: true,
        logLevel: 'error',
      },
    ],
    server: HTTPS
      ? {
          type: 'https',
          options: {
            key: httpsKeyPath,
            cert: httpsCertPath,
          },
        }
      : {},
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'x-qlik-xrfkey,qlik-csrf-token',
    },
  };

  const compiler = webpack(config);
  const server = new WebpackDevServer(options, compiler);

  const close = () => {
    server.stop();
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, close);
  });

  if (watcher) {
    let inError = false;
    watcher.on('event', (event) => {
      if (event.code === 'ERROR') {
        inError = true;
        server.sockWrite(server.sockets, 'errors', [event.error.stack]);
      } else if (event.code === 'BUNDLE_END' && inError) {
        inError = false;
        server.sockWrite(server.sockets, 'ok');
      }
    });
  }

  let initiated = false;

  return new Promise((resolve) => {
    compiler.hooks.done.tap('nebula serve', (stats) => {
      if (!initiated) {
        initiated = true;

        const banner = `
     _  _________  __  ____   ___
    / |/ / __/ _ )/ / / / /  / _ |
   /    / _// _  / /_/ / /__/ __ |
  /_/|_/___/____/\\____/____/_/ |_|
      / __/ __/ _ \\ | / / __/
     _\\ \\/ _// , _/ |/ / _/
    /___/___/_/|_||___/___/
         `;

        const styledBanner = banner
          .split('\n')
          .map((line) => {
            const trimmedLine = line.trimEnd();
            if (!trimmedLine) {
              return '';
            }

            const leadingWhitespace = trimmedLine.match(/^\s*/)[0];
            const art = trimmedLine.slice(leadingWhitespace.length);
            // Brand color for the nebula serve startup banner
            return `${leadingWhitespace}${chalk.bgHex('#eee832').white(art)}`;
          })
          .join('\n');

        console.log(styledBanner);

        if (serveConfig.mfe) {
          const bundleUrl = `${url}/pkg/${encodeURIComponent(snName)}`;
          console.log('Development server running in MFE mode');
          console.log(`Bundle served at ${chalk.green(bundleUrl)}`);
          console.log('');
          console.log('Use the bundle when overriding the import map');
        } else {
          console.log(`Development server running at ${chalk.green(url)}`);
        }

        resolve({
          context: '',
          url,
          close,
        });

        if (stats.hasErrors()) {
          stats.compilation.errors.forEach((e) => {
            console.log(chalk.red(e));
          });
          process.exit(1);
        }
      }
    });

    server.start();
  });
};
