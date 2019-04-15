const path = require('path');
const chalk = require('chalk');

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const nm = require.resolve('leonardo-ui');
const nmPath = nm.substring(0, nm.lastIndexOf('node_modules') + 12);

module.exports = async ({
  host,
  port,
  publicDir,
  enigmaConfig,
  snName,
  snPath,
}) => {
  const config = {
    mode: 'development',
    entry: {
      render: [
        path.resolve(publicDir, 'render'),
      ],
      dev: [
        path.resolve(publicDir, 'dev'),
      ],
      hub: [
        path.resolve(publicDir, 'hub'),
      ],
    },
    devtool: 'source-map',
    output: {
      path: path.resolve(publicDir, 'dist'),
      filename: '[name].js',
    },
    resolve: {
      alias: {
        snDefinition: snPath,
      },
      extensions: ['.js', '.jsx'],
    },
    module: {
      rules: [{
        test: /\.jsx?$/,
        sideEffects: false,
        include: [
          publicDir,
          /react-leonardo-ui/,
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                modules: false,
                targets: {
                  browsers: ['last 2 chrome versions'],
                },
              }],
              '@babel/preset-react',
            ],
          },
        },
      }],
    },
    plugins: [
      new webpack.DefinePlugin({
        SN_NAME: JSON.stringify(snName),
        ENIGMA_HOST: JSON.stringify(enigmaConfig.host || ''),
        ENIGMA_PORT: JSON.stringify(enigmaConfig.port || 9076),
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(publicDir, 'render.html'),
        filename: 'render.html',
        chunks: ['render'],
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(publicDir, 'dev.html'),
        filename: 'dev.html',
        chunks: ['dev'],
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(publicDir, 'hub.html'),
        filename: 'hub.html',
        chunks: ['hub'],
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
      path.resolve(publicDir, 'dist'),
      nmPath,
    ],
    historyApiFallback: {
      index: '/hub.html',
    },
    proxy: [{
      context: '/render',
      target: `http://${host}:${port}/render.html`,
      ignorePath: true,
    }, {
      context: '/dev',
      target: `http://${host}:${port}/dev.html`,
      ignorePath: true,
    }],
  };

  console.log('Starting development server...');

  WebpackDevServer.addDevServerEntrypoints(config, options);
  const compiler = webpack(config);
  const server = new WebpackDevServer(compiler, options);

  const close = () => {
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
          process.exit(1);
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
