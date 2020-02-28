const path = require('path');
const babel = require('rollup-plugin-babel'); // eslint-disable-line
const { terser } = require('rollup-plugin-terser'); // eslint-disable-line

const cwd = process.cwd();
const pkg = require(path.join(cwd, 'package.json')); // eslint-disable-line
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
  'Safari >= 10.0',
  'iOS >= 11.2',
];

const cfg = {
  input: path.resolve(cwd, 'src', 'renderer'),
  output: {
    file: path.resolve(cwd, 'client.js'),
    format: 'umd',
    exports: 'default',
    name: 'snapshooter',
    banner,
  },
  plugins: [
    babel({
      babelrc: false,
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
            targets: {
              browsers: [...browserList, ...['ie 11', 'chrome 47']],
            },
          },
        ],
      ],
    }),
  ],
};

if (process.env.NODE_ENV === 'production') {
  cfg.plugins.push(
    terser({
      output: {
        preamble: banner,
      },
    })
  );
}

module.exports = [cfg].filter(Boolean);
