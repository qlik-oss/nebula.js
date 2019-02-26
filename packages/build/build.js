const path = require('path');

const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const postcss = require('rollup-plugin-postcss');
const replace = require('rollup-plugin-replace');
const { terser } = require('rollup-plugin-terser');

const config = ({
  mode = 'production',
  format = 'umd',
  cwd = process.cwd(),
} = {}) => {
  const pkg = require(path.resolve(cwd, 'package.json')); // eslint-disable-line
  const {
    name,
    version,
    license,
    author,
  } = pkg;

  const banner = `/*
* ${name} v${version}
* Copyright (c) ${new Date().getFullYear()} ${author.name} <${author.email}>
* Released under the ${license} license.
*/
`;

  return {
    input: {
      input: path.resolve(cwd, 'src/index'),
      plugins: [
        replace({
          'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
        }),
        babel({
          babelrc: false,
          presets: [
            ['@babel/preset-env', {
              modules: false,
              targets: {
                browsers: ['ie 11', 'chrome 47'],
              },
            }],
          ],
        }),
        postcss({}),
        ...[mode === 'production' ? terser({
          output: {
            preamble: banner,
          },
        }) : false],
      ].filter(Boolean),
    },
    output: {
      banner,
      format,
      file: format === 'esm' && pkg.module ? pkg.module : pkg.main,
      name: pkg.name,
      output: {
        preamble: banner,
      },
    },
  };
};

const minified = async () => {
  const c = config({
    mode: 'production',
    format: 'umd',
  });
  const bundle = await rollup.rollup(c.input);
  await bundle.write(c.output);
};

const esm = async () => {
  const c = config({
    mode: 'development',
    format: 'esm',
  });
  const bundle = await rollup.rollup(c.input);
  await bundle.write(c.output);
};

const watch = async () => {
  const c = config({
    mode: 'development',
    format: 'esm',
  });
  const watcher = rollup.watch({
    ...c.input,
    output: c.output,
  });

  return new Promise((resolve, reject) => {
    watcher.on('event', (event) => {
      if (event.code === 'FATAL') {
        console.error(event);
        reject();
      }
      if (event.code === 'ERROR') {
        console.error(event);
        reject();
      }
      if (event.code === 'END') {
        resolve(watcher);
      }
    });
  });
};

async function build(argv) {
  if (argv.watch) {
    watch();
  } else {
    await minified();
    await esm();
  }
}

module.exports = {
  build,
  watch,
};
