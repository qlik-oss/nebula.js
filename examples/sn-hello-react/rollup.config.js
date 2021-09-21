const path = require('path');

const babel = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const postcss = require('rollup-plugin-postcss');
const replace = require('@rollup/plugin-replace');

module.exports = [
  {
    input: path.resolve(__dirname, 'src', 'index'),
    output: {
      file: path.resolve(__dirname, 'dist', 'hello-react.js'),
      name: 'mystuff',
      format: 'umd',
      exports: 'default',
      sourcemap: true,
      globals: {
        '@nebula.js/stardust': 'stardust',
      },
    },
    external: ['@nebula.js/stardust'],
    plugins: [
      nodeResolve({
        extensions: ['.js', '.jsx'],
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true,
      }),
      babel({
        babelrc: false,
        include: ['src/**'],
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false,
              targets: {
                browsers: ['last 2 Chrome versions'],
              },
            },
          ],
        ],
        plugins: [['@babel/plugin-transform-react-jsx']],
      }),
      postcss({}),
      commonjs(),
    ],
  },
];
