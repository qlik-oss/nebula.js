const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const crypto = require('crypto');
const { version } = require('../package.json');

const isSrc = /^([.]{2}\/)/;
const namespace = /^webpack:\/\/([^/]+)\//;
const NM = /node_modules/;
const WP = /\/\(?webpack\)?/;
const versionHash = crypto.createHash('md5').update(version).digest('hex').slice(0, 4);

const cfg = ({ srcDir = path.resolve(__dirname, '../dist'), serveConfig = {} }) => {
  const folderName = process.cwd().split('/').slice(-1)[0];

  const config = {
    mode: 'development',
    entry: path.resolve(__dirname, './sn.js'),
    devtool: false,
    output: {
      path: path.resolve(srcDir, 'temp'),
      filename: '[name].js',
      devtoolModuleFilenameTemplate: (info) => {
        // attempt to improve the mapping of multiple libraries into
        // a better folder structure for easier debugging

        // if source files are referenced as "webpack://foo/"
        // then output those references as "foo:///"
        const ns = namespace.exec(info.resourcePath);
        if (ns && !NM.test(info.resourcePath) && !WP.test(info.resourcePath)) {
          return `${ns[1]}:///${info.resourcePath.replace(namespace, '')}`;
        }

        // if source files are referenced as relative paths: "../bla"
        // then output those references as "folderName:///bla"
        if (!info.moduleId && isSrc.test(info.resourcePath)) {
          const pp = info.resourcePath.replace(isSrc, '');
          return `${folderName || 'sn'}:///${pp}`;
        }

        // otherwise output using webpack default pattern
        return `webpack://${info.namespace}/${info.resourcePath}`;
      },
    },
    resolve: {
      alias: {
        fixtures: path.resolve(process.cwd(), 'test/component'),
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NEBULA_VERSION': JSON.stringify(version),
        'process.env.NEBULA_VERSION_HASH': JSON.stringify(versionHash),
        ...(typeof serveConfig.replacementStrings === 'function' ? serveConfig.replacementStrings() : {}),
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(srcDir, 'eRender.html'),
        filename: 'eRender.html',
        inject: 'head',
        scripts: serveConfig.scripts,
        stylesheets: serveConfig.stylesheets,
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(srcDir, 'eDev.html'),
        filename: 'eDev.html',
        inject: 'head',
      }),
    ],
  };

  return config;
};

module.exports = cfg;
