const path = require('path');

const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const nodeResolve = require('rollup-plugin-node-resolve');
const postcss = require('rollup-plugin-postcss');

module.exports = [{
  input: path.resolve(__dirname, 'src', 'index'),
  output: {
    file: path.resolve(__dirname, 'dist', 'hello-react.js'),
    name: 'mystuff',
    format: 'umd',
    exports: 'default',
    sourcemap: true,
  },
  plugins: [
    nodeResolve({
      extensions: ['.js', '.jsx'],
    }),
    babel({
      babelrc: false,
      include: [
        'src/**',
      ],
      presets: [
        ['@babel/preset-env', {
          modules: false,
          targets: {
            browsers: ['last 2 Chrome versions'],
          },
        }],
      ],
      plugins: [
        ['@babel/plugin-transform-react-jsx'],
      ],
    }),
    postcss({}),
    commonjs(),
  ],
}];
