const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isSrc = /^([.]{2}\/)/;
const namespace = /^webpack:\/\/([^/]+)\//;
const NM = /node_modules/;
const WP = /\/\(?webpack\)?/;

const cfg = ({ srcDir = path.resolve(__dirname, '../dist') }) => {
  const folderName = process
    .cwd()
    .split('/')
    .slice(-1)[0];

  const config = {
    mode: 'development',
    entry: path.resolve(__dirname, './sn.js'),
    devtool: 'source-map',
    output: {
      path: path.resolve(srcDir, 'temp'),
      filename: '[name].js',
      devtoolModuleFilenameTemplate: info => {
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
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(srcDir, 'eRender.html'),
        filename: 'eRender.html',
        inject: 'head',
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
