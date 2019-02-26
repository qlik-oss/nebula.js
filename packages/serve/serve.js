const path = require('path');
const fs = require('fs');

const chalk = require('chalk');
const portfinder = require('portfinder');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { watch } = require('@nebula.js/cli-build');

const nm = require.resolve('leonardo-ui');
const nmPath = nm.substring(0, nm.lastIndexOf('node_modules') + 12);

module.exports = async (argv) => {
  const port = argv.port || await portfinder.getPortPromise();
  const host = argv.host || 'localhost';
  const enigmaConfig = argv.enigma || {};
  let snPath;
  let snName;
  let watcher;
  if (argv.sn) {
    snPath = path.resolve(argv.sn);
    const parsed = path.parse(snPath);
    snName = parsed.name;
  } else {
    if (argv.build !== false) {
      watcher = await watch();
    }
    const context = process.cwd();
    const externalPkg = require(path.resolve(context, 'package.json')); // eslint-disable-line global-require
    const externalEntry = externalPkg.module || externalPkg.main;
    snName = externalPkg.name;
    snPath = path.resolve(context, externalEntry);
  }
  if (!fs.existsSync(snPath)) {
    const rel = path.relative(process.cwd(), snPath);
    console.log(chalk.red(`The specified entry point ${chalk.yellow(rel)} does not exist`));
    return;
  }

  const config = {
    mode: 'development',
    entry: {
      app: [
        path.resolve(__dirname, 'public', 'index'),
      ],
    },
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
    },
    resolve: {
      alias: {
        snDefinition: snPath,
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        SN_NAME: JSON.stringify(snName),
        ENIGMA_HOST: JSON.stringify(enigmaConfig.host || ''),
        ENIGMA_PORT: JSON.stringify(enigmaConfig.port || 9076),
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public', 'index.html'),
      }),
      new webpack.HotModuleReplacementPlugin(),
    ],
  };

  const options = {
    clientLogLevel: 'none',
    hot: true,
    host,
    port,
    overlay: {
      warnings: false,
      errors: true,
    },
    quiet: true,
    open: true,
    contentBase: [
      path.resolve(__dirname, 'public'),
      nmPath,
    ],
  };

  console.log('Starting development server...');

  WebpackDevServer.addDevServerEntrypoints(config, options);
  const compiler = webpack(config);
  const server = new WebpackDevServer(compiler, options);

  const close = () => {
    if (watcher) {
      watcher.close();
    }
    server.close(() => {
      process.exit(0);
    });
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, close);
  });

  let initiated = false;

  return new Promise((resolve, reject) => { // eslint-disable-line consistent-return
    compiler.hooks.done.tap('nebula serve', (stats) => {
      if (!initiated) {
        initiated = true;
        const url = `http://${host}:${port}`;
        console.log(`...running at ${chalk.green(url)}`);

        resolve({
          context: '',
          url,
          close,
        });

        if (stats.hasErrors()) {
          stats.compilation.errors.forEach((e) => {
            console.log(chalk.red(e));
          });
        }
      }
    });

    server.listen(port, host, (err) => {
      if (err) {
        reject(err);
      }
    });
  });
};
