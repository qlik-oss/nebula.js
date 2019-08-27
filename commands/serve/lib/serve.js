const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const portfinder = require('portfinder');
const { watch } = require('@nebula.js/cli-build');

const webpackServe = require('./webpack.serve.js');

const useEngine = require('./engine');

module.exports = async argv => {
  let stopEngine = () => {};
  if (argv.ACCEPT_EULA) {
    stopEngine = await useEngine(argv);
  }
  const port = argv.port || (await portfinder.getPortPromise());
  const host = argv.host || 'localhost';
  const enigmaConfig = {
    port: 9076,
    host: 'localhost',
    ...argv.enigma,
  };
  const context = process.cwd();
  let snPath;
  let snName;
  let watcher;
  if (argv.entry) {
    snPath = path.resolve(context, argv.entry);
    const parsed = path.parse(snPath);
    snName = parsed.name;
  } else {
    if (argv.build !== false) {
      watcher = await watch();
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
    snName,
    snPath,
    dev: process.env.MONO === 'true',
    open: argv.open !== false,
    watcher,
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
