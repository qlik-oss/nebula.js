const path = require('path');

const chalk = require('chalk');
const portfinder = require('portfinder');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const nm = require.resolve('leonardo-ui');
const nmPath = nm.substring(0, nm.lastIndexOf('node_modules') + 12);

module.exports = async (argv) => {
  const port = argv.port || await portfinder.getPortPromise();
  const host = argv.host || 'localhost';
  const enigmaConfig = argv.enigma || {};
  let snPath;
  let snName;
  if (argv.sn) {
    snPath = path.resolve(argv.sn);
    const parsed = path.parse(snPath);
    snName = parsed.name;
  } else {
    const context = process.cwd();
    const externalPkg = require(path.resolve(context, 'package.json')); // eslint-disable-line global-require
    snName = externalPkg.name;
    snPath = context;
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

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => {
      server.close(() => {
        process.exit(0);
      });
    });
  });
  let initiated = false;

  return new Promise((resolve, reject) => {
    compiler.hooks.done.tap('nebula serve', (stats) => {
      if (!initiated) {
        initiated = true;
        const url = `http://${host}:${port}`;
        console.log(`...running at ${chalk.green(url)}`);

        resolve({
          context: '',
          url,
          close() {
            server.close();
          },
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
