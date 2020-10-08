const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const babelPath = require.resolve('babel-loader');
const babelPresetEnvPath = require.resolve('@babel/preset-env');
const babelPresetReactPath = require.resolve('@babel/preset-react');
const sourceMapLoaderPath = require.resolve('source-map-loader');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const favicon = path.resolve(__dirname, '../../../docs/assets/njs.png');

const crypto = require('crypto');
const { version } = require('../package.json');

const versionHash = crypto.createHash('md5').update(version).digest('hex').slice(0, 4);

const cfg = ({ srcDir, distDir, dev = false, serveConfig = {} }) => {
  const config = {
    mode: dev ? 'development' : 'production',
    entry: {
      eRender: [path.resolve(srcDir, 'eRender')],
      eDev: [path.resolve(srcDir, 'eDev')],
      eHub: [path.resolve(srcDir, 'eHub')],
    },
    devtool: dev ? 'cheap-module-eval-source-map' : false,
    output: {
      path: distDir,
      filename: '[name].js',
    },
    resolve: {
      alias: {
        '@nebula.js/stardust': path.resolve(__dirname, '../../../apis/stardust/src'),
        '@nebula.js/snapshooter/client': path.resolve(__dirname, '../../../apis/snapshooter/src/renderer'),
        '@nebula.js/theme': path.resolve(__dirname, '../../../apis/theme/src'),
        '@nebula.js/locale/all.json$': path.resolve(__dirname, '../../../apis/locale/all.json'),
        '@nebula.js/locale': path.resolve(__dirname, '../../../apis/locale/src'),
        fixtures: path.resolve(__dirname, '../../../test/component'),
      },
      extensions: ['.dev.js', '.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          include: [/node_modules[/\\]monaco-editor/],
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.ttf$/,
          include: [/node_modules[/\\]monaco-editor/],
          use: ['file-loader'],
        },
        {
          enforce: 'pre',
          test: /\.js?$/,
          loader: sourceMapLoaderPath,
        },
        {
          test: /\.jsx?$/,
          sideEffects: false,
          include: [srcDir, /nucleus/, /ui[/\\]icons/],
          use: {
            loader: babelPath,
            options: {
              presets: [
                [
                  babelPresetEnvPath,
                  {
                    modules: false,
                    targets: {
                      browsers: ['last 2 chrome versions'],
                    },
                  },
                ],
                babelPresetReactPath,
              ],
            },
          },
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        __NEBULA_DEV__: true,
        'process.env.NEBULA_VERSION': JSON.stringify(version),
        'process.env.NEBULA_VERSION_HASH': JSON.stringify(versionHash),
      }),
      new MonacoWebpackPlugin({ languages: ['json'] }),
      new HtmlWebpackPlugin({
        template: path.resolve(srcDir, 'eRender.html'),
        filename: 'eRender.html',
        chunks: ['eRender'],
        favicon,
        scripts: serveConfig.scripts,
        stylesheets: serveConfig.stylesheets,
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(srcDir, 'eDev.html'),
        filename: 'eDev.html',
        chunks: ['eDev'],
        favicon,
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(srcDir, 'eHub.html'),
        filename: 'eHub.html',
        chunks: ['eHub'],
        favicon,
      }),
    ],
  };

  return config;
};

if (!process.env.DEFAULTS) {
  module.exports = cfg;
} else {
  module.exports = cfg({
    srcDir: path.resolve(__dirname, '../web'),
    distDir: path.resolve(__dirname, '../dist'),
    dev: false,
  });
}
