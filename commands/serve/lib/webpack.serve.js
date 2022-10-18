/* eslint global-require: 0 */
const path = require('path');
const chalk = require('chalk');
const express = require('express');
const fs = require('fs');
const homedir = require('os').homedir();
const { Auth, AuthType } = require('@qlik/sdk');

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const snapshooterFn = require('./snapshot-server');
const snapshotRouter = require('./snapshot-router');

const httpsKeyPath = path.join(homedir, '.certs/key.pem');
const httpsCertPath = path.join(homedir, '.certs/cert.pem');

let authInstance = null;
const getAuthInstance = (returnToOrigin, host, clientId) => {
  if (authInstance) return authInstance;

  authInstance = new Auth({
    authType: AuthType.OAuth2,
    host,
    clientId,
    redirectUri: `${returnToOrigin}/login/callback`,
  });
  return authInstance;
};

module.exports = async ({
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
  const HTTPS = serveConfig.mfe;
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
    const webpackConfig = require('./webpack.build');
    const srcDir = path.resolve(__dirname, '../web');
    const distDir = path.resolve(srcDir, '../dist');
    contentBase = distDir;
    config = webpackConfig({
      srcDir,
      distDir,
      dev: true,
      serveConfig,
    });
  } else {
    const webpackConfig = require('./webpack.prod');
    const srcDir = path.resolve(__dirname, '../dist');
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
    historyApiFallback: {
      index: '/eHub.html',
    },
    // Disable nebula serve dev env when in MFE mode
    static: !serveConfig.mfe && {
      directory: contentBase,
      watch: {
        ignored: /node_modules/,
      },
    },
    onBeforeSetupMiddleware(devServer) {
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
          enigma: enigmaConfig,
          clientId,
          webIntegrationId,
          supernova: {
            name: snName,
            url: snUrl,
          },
          sock: {
            port: entryWatcher && entryWatcher.port,
          },
          flags: serveConfig.flags,
          themes: themes.map((theme) => theme.id),
          types: serveConfig.types,
          keyboardNavigation: serveConfig.keyboardNavigation,
        });
      });

      let cachedHost = null;
      let cachedClientId = null;

      app.get('/oauth', async (req, res) => {
        const { host: qHost, clientId: qClientId } = req.query;
        if (!cachedHost && !cachedClientId) {
          cachedHost = qHost;
          cachedClientId = qClientId;
        }

        const returnTo = `${req.protocol}://${req.get('host')}`;
        const instacne = getAuthInstance(returnTo, qHost, qClientId);
        const isAuthorized = await instacne.isAuthorized();
        if (!isAuthorized) {
          const { url: redirectUrl } = await instacne.generateAuthorizationUrl();
          res.status(200).json({ redirectUrl });
        } else {
          const redirectUrl = `${req.protocol}://${req.get(
            'host'
          )}/?engine_url=wss://${cachedHost}&qlik-client-id=${cachedClientId}&shouldFetchAppList=true`;
          cachedHost = null;
          cachedClientId = null;
          res.redirect(redirectUrl);
        }
      });

      app.get('/login/callback', async (req, res) => {
        const authLink = new URL(req.url, `http://${req.headers.host}`).href;
        try {
          // TODO:
          // this is a temp fix in front end side
          // (temp workaround of not presisting origin while backend tries to authorize user)
          // they need to handle this in qlik-sdk-typescript repo
          // and will notify us about when they got fixed it,
          // but until then, we need to take care of it here!
          authInstance.rest.interceptors.request.use((_req) => {
            // eslint-disable-next-line no-param-reassign, dot-notation
            _req[1]['headers'] = { origin: 'http://localhost:8000' };
            return _req;
          });
          await authInstance.authorize(authLink);
          res.redirect(301, '/oauth/');
        } catch (err) {
          console.log({ err });
          res.status(401).send(JSON.stringify(err, null, 2));
        }
      });

      app.get('/getSocketUrl/:appId', async (req, res) => {
        const { appId } = req.params;
        const webSocketUrl = await authInstance.generateWebsocketUrl(appId, true);
        res.status(200).json({ webSocketUrl });
      });

      app.get('/deauthorize', async (req, res) => {
        try {
          await authInstance.deauthorize();
          res.status(200).json({
            deauthorize: true,
          });
        } catch (error) {
          console.log({ error });
        }
      });

      app.get('/isAuthorized', async (req, res) => {
        if (!authInstance) {
          res.status(200).json({
            isAuthorized: false,
          });
        } else {
          const isAuthorized = await authInstance.isAuthorized();
          res.status(200).json({
            isAuthorized,
          });
        }
      });

      app.get('/apps', async (req, res) => {
        const appsListUrl = `/items?resourceType=app&limit=30&sort=-updatedAt`;
        const { data = [] } = await (await authInstance.rest(appsListUrl)).json();
        res.status(200).json(
          data.map((d) => ({
            qDocId: d.resourceId,
            qTitle: d.name,
          }))
        );
      });

      if (serveConfig.resources) {
        app.use('/resources', express.static(serveConfig.resources));
      }

      app.use('/assets', express.static(path.resolve(__dirname, '../assets')));
    },
    proxy: [
      {
        context: '/render',
        target: `${url}/eRender.html`,
        ignorePath: true,
        logLevel: 'error',
      },
      {
        context: '/dev',
        target: `${url}/eDev.html`,
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
    // eslint-disable-line consistent-return
    compiler.hooks.done.tap('nebula serve', (stats) => {
      if (!initiated) {
        initiated = true;

        console.log(`     _  _________  __  ____   ___
    / |/ / __/ _ )/ / / / /  / _ |
   /    / _// _  / /_/ / /__/ __ |
  /_/|_/___/____/\\____/____/_/ |_|
    / __/ __/ _ \\ | / / __/
   _\\ \\/ _// , _/ |/ / _/
  /___/___/_/|_||___/___/
         `);

        if (serveConfig.mfe) {
          const bundleUrl = `${url}/pkg/${snName}`;
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
