const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const cfg = ({
  srcDir,
  distDir,
  snPath,
  dev = false,
}) => {
  const config = {
    mode: dev ? 'development' : 'production',
    entry: {
      eRender: [
        path.resolve(srcDir, 'eRender'),
      ],
      eDev: [
        path.resolve(srcDir, 'eDev'),
      ],
      eHub: [
        path.resolve(srcDir, 'eHub'),
      ],
    },
    devtool: 'source-map',
    output: {
      path: distDir,
      filename: '[name].js',
    },
    resolve: {
      alias: {
        snDefinition: snPath,
      },
      extensions: ['.js', '.jsx'],
    },
    externals: dev ? {} : 'snDefinition',
    module: {
      rules: [{
        test: /\.jsx?$/,
        sideEffects: false,
        include: [
          srcDir,
          /nucleus/,
          /ui\/icons/,
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
      new HtmlWebpackPlugin({
        template: path.resolve(srcDir, 'eRender.html'),
        filename: 'eRender.html',
        chunks: ['eRender'],
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(srcDir, 'eDev.html'),
        filename: 'eDev.html',
        chunks: ['eDev'],
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(srcDir, 'eHub.html'),
        filename: 'eHub.html',
        chunks: ['eHub'],
      }),
      new webpack.HotModuleReplacementPlugin(),
    ],
  };

  return config;
};

if (process.stdin.isTTY) {
  module.exports = cfg;
} else {
  module.exports = cfg({
    srcDir: path.resolve(__dirname, '../web'),
    distDir: path.resolve(__dirname, '../dist'),
    snPath: path.resolve(__dirname, 'placeholder'),
    dev: false,
  });
}
