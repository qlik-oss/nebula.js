const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const portfinder = require('portfinder');
const extend = require('extend');
const yargs = require('yargs');
const build = require('@nebula.js/cli-build');

const initConfig = require('./init-config');

const webpackServe = require('./webpack.serve.js');
const useEngine = require('./engine');

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
  const port = serveConfig.port || (await portfinder.getPortPromise());
  const host = serveConfig.host || 'localhost';
  const enigmaConfig = serveConfig.enigma;

  let snPath;
  let snName;
  let watcher;
  if (serveConfig.entry) {
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
      const externalEntry = externalPkg.module || externalPkg.main;
      snName = externalPkg.name;
      snPath = path.resolve(context, externalEntry);
    } catch (e) {
      //
    }
  }
  if (!fs.existsSync(snPath)) {
    const rel = path.relative(context, snPath);
    console.log(chalk.red(`The specified entry point ${chalk.yellow(rel)} does not exist`));
    return;
  }

  const server = await webpackServe({
    host,
    port,
    enigmaConfig,
    webIntegrationId: serveConfig.webIntegrationId,
    snName: serveConfig.type || snName,
    snPath,
    dev: process.env.MONO === 'true',
    open: serveConfig.open !== false,
    watcher,
    serveConfig,
  });

  const close = async () => {
    await stopEngine();
    if (watcher) {
      watcher.close();
    }
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
