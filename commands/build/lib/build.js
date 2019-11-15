const path = require('path');

const extend = require('extend');
const yargs = require('yargs');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const postcss = require('rollup-plugin-postcss');
const replace = require('rollup-plugin-replace');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const babelPreset = require('@babel/preset-env');

const { terser } = require('rollup-plugin-terser');

const initConfig = require('./init-config');

const config = ({ mode = 'production', format = 'umd', cwd = process.cwd() } = {}) => {
  const pkg = require(path.resolve(cwd, 'package.json')); // eslint-disable-line
  const { name, version, license, author } = pkg;

  if (format === 'esm' && !pkg.module) {
    return false;
  }

  const auth = typeof author === 'object' ? `${author.name} <${author.email}>` : author || '';
  const moduleName = name.split('/').reverse()[0];

  const banner = `/*
* ${name} v${version}
* Copyright (c) ${new Date().getFullYear()} ${auth}
* Released under the ${license} license.
*/
`;

  // all peers should be externals for esm bundle
  const external = format === 'esm' ? Object.keys(pkg.peerDependencies || {}) : [];

  return {
    input: {
      input: path.resolve(cwd, 'src/index'),
      external,
      plugins: [
        replace({
          'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
        }),
        nodeResolve(),
        commonjs(),
        babel({
          babelrc: false,
          presets: [
            [
              babelPreset,
              {
                modules: false,
                targets: {
                  browsers: ['ie 11', 'chrome 47'],
                },
              },
            ],
          ],
        }),
        postcss({}),
        ...[
          mode === 'production'
            ? terser({
                output: {
                  preamble: banner,
                },
              })
            : false,
        ],
      ].filter(Boolean),
    },
    output: {
      banner,
      format,
      file: format === 'esm' && pkg.module ? pkg.module : pkg.main,
      name: moduleName,
      sourcemap: true,
      output: {
        preamble: banner,
      },
    },
  };
};

const minified = async argv => {
  const c = config({
    mode: 'production',
    format: 'umd',
    argv,
  });
  const bundle = await rollup.rollup(c.input);
  await bundle.write(c.output);
};

const esm = async argv => {
  const c = config({
    mode: 'development',
    format: 'esm',
    argv,
  });
  if (!c) {
    return Promise.resolve();
  }
  const bundle = await rollup.rollup(c.input);
  return bundle.write(c.output);
};

const watch = async argv => {
  const c = config({
    mode: 'development',
    format: 'umd',
    argv,
  });

  const watcher = rollup.watch({
    ...c.input,
    output: c.output,
  });

  return new Promise((resolve, reject) => {
    watcher.on('event', event => {
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

async function build(argv = {}) {
  let defaultBuildConfig = {};

  // if not runnning via command line, run the config to inject default values
  if (!argv.$0) {
    defaultBuildConfig = initConfig(yargs([])).argv;
  }

  const buildConfig = extend(true, {}, defaultBuildConfig, argv);
  if (buildConfig.watch) {
    return watch(buildConfig);
  }
  await minified(buildConfig);
  return esm(buildConfig);
}

module.exports = build;
