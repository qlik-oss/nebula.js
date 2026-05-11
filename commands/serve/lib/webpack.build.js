import path from 'path';
import crypto from 'crypto';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const moduleDir = path.dirname(fileURLToPath(import.meta.url));

const babelPath = require.resolve('babel-loader');
const babelPresetEnvPath = require.resolve('@babel/preset-env');
const babelPresetReactPath = require.resolve('@babel/preset-react');
const sourceMapLoaderPath = require.resolve('source-map-loader');

const favicon = path.resolve(moduleDir, '../../../docs/assets/njs.png');

const { version } = require('../package.json');

const versionHash = crypto.createHash('md5').update(version).digest('hex').slice(0, 4);

const cfg = ({ srcDir, distDir, dev = false, serveConfig = {} }) => {
  const config = {
    mode: dev ? 'development' : 'production',
    entry: {
      eRender: [path.resolve(srcDir, 'eRender')],
      eHub: [path.resolve(srcDir, 'eHub')],
      fixtures: [path.resolve(moduleDir, './fixtures.js')],
    },
    devtool: 'source-map',
    output: {
      path: distDir,
      filename: '[name].js',
      publicPath: '/',
    },
    resolve: {
      alias: {
        '@nebula.js/stardust': path.resolve(moduleDir, '../../../apis/stardust/src'),
        '@nebula.js/snapshooter/client': path.resolve(moduleDir, '../../../apis/snapshooter/src/renderer'),
        '@nebula.js/theme': path.resolve(moduleDir, '../../../apis/theme/src'),
        '@nebula.js/conversion': path.resolve(moduleDir, '../../../apis/conversion/src'),
        '@nebula.js/locale/all.json$': path.resolve(moduleDir, '../../../apis/locale/all.json'),
        '@nebula.js/locale': path.resolve(moduleDir, '../../../apis/locale/src'),
        fixtures: path.resolve(process.cwd(), serveConfig.fixturePath || ''),
      },
      extensions: ['.dev.js', '.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.ttf$/,
          type: 'asset/resource',
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
    ignoreWarnings: [/node_modules[/\\]@qlik[/\\]sdk/],
    plugins: [
      new webpack.DefinePlugin({
        __NEBULA_DEV__: true,
        'process.env.NEBULA_VERSION': JSON.stringify(version),
        'process.env.NEBULA_VERSION_HASH': JSON.stringify(versionHash),
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(srcDir, 'eRender.html'),
        filename: 'eRender.html',
        // Include fixture only when running Nebula serve
        chunks: dev ? ['eRender', 'fixtures'] : ['eRender'],
        favicon,
        scripts: serveConfig.scripts,
        stylesheets: serveConfig.stylesheets,
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(srcDir, 'index.html'),
        filename: 'index.html',
        chunks: ['eHub'],
        favicon,
      }),
    ],
  };

  return config;
};

const defaultExport = !process.env.DEFAULTS
  ? cfg
  : cfg({
      srcDir: path.resolve(moduleDir, '../web'),
      distDir: path.resolve(moduleDir, '../dist'),
      dev: process.env.NODE_ENV !== 'production',
    });

export default defaultExport;
