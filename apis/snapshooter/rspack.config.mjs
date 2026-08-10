import path from 'path';
import { createRequire } from 'module';
// @rspack/core ships only an "exports" field (no "main"); this project's import
// resolver does not resolve conditional exports, so it can't be statically resolved here.
// eslint-disable-next-line import/no-unresolved
import { rspack } from '@rspack/core';

const require = createRequire(import.meta.url);

const cwd = process.cwd();
const pkg = require(path.join(cwd, 'package.json'));
const { name, version, license } = pkg;

const banner = `/*
* ${name} v${version}
* Copyright (c) ${new Date().getFullYear()} QlikTech International AB
* Released under the ${license} license.
*/
`;

const browserList = [
  'last 2 Chrome versions',
  'last 2 Firefox versions',
  'last 2 Edge versions',
  'Safari >= 11.0',
  'iOS >= 12.2',
];

const config = {
  mode: 'none',
  target: ['web', 'es2017'],
  entry: path.resolve(cwd, 'src', 'renderer'),
  devtool: false, // no sourcemap -- parity with today (rollup config has no sourcemap option set)
  output: {
    path: cwd,
    filename: 'client.js',
    globalObject: 'this',
    // export:'default' is REQUIRED -- parity with rollup's exports:'default'.
    // window.snapshooter must BE the exported function itself, not { default: fn }.
    library: { name: 'snapshooter', type: 'umd', export: 'default' },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: require.resolve('babel-loader'),
          options: {
            babelrc: false,
            presets: [
              [
                '@babel/preset-env',
                {
                  modules: false,
                  targets: {
                    browsers: [...browserList, 'chrome 62'],
                  },
                },
              ],
            ],
            // NO react-jsx plugin, NO locale validator -- this config has neither in the original
          },
        },
      },
    ],
  },
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin({
        minimizerOptions: {
          format: {
            comments: false,
          },
        },
      }),
    ],
  },
  plugins: [
    new rspack.BannerPlugin({
      banner,
      raw: true,
      entryOnly: true,
      // after minification, but before the source maps are finalized, so that
      // the banner is emitted verbatim
      stage: rspack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE + 1,
    }),
    // deliberately NO DefinePlugin -- the original config has no replace() plugin
  ],
};

export default config;
