const path = require('path');
const chalk = require('chalk');
const readline = require('readline');

const extend = require('extend');
const yargs = require('yargs');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const postcss = require('rollup-plugin-postcss');
const replace = require('@rollup/plugin-replace');
const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

const babelPreset = require('@babel/preset-env');

const { terser } = require('rollup-plugin-terser');

const initConfig = require('./init-config');

const config = ({ mode = 'production', format = 'umd', cwd = process.cwd(), argv = { sourcemap: true } } = {}) => {
  const pkg = require(path.resolve(cwd, 'package.json')); // eslint-disable-line
  const { name, version, license, author } = pkg;
  const { sourcemap } = argv;

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
  const peers = pkg.peerDependencies || {};
  const external = format === 'esm' ? Object.keys(peers) : [];

  // supernova should always be external
  if (!peers['@nebula.js/supernova']) {
    console.warn('@nebula.js/supernova should be specified as a peer dependency');
  } else if (external.indexOf('@nebula.js/supernova') === -1) {
    external.push('@nebula.js/supernova');
  }

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
      sourcemap,
      globals: {
        '@nebula.js/supernova': 'supernova',
      },
      output: {
        preamble: banner,
      },
    },
  };
};

const minified = async (argv) => {
  const c = config({
    mode: 'production',
    format: 'umd',
    argv,
  });
  const bundle = await rollup.rollup(c.input);
  await bundle.write(c.output);
};

const esm = async (argv) => {
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

function clearScreen(msg) {
  // source: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-shared-utils/lib/logger.js
  if (process.stdout.isTTY) {
    const blank = '\n'.repeat(process.stdout.rows);
    console.log(blank);
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
    if (msg) {
      console.log(msg);
    }
  }
}

const watch = async (argv) => {
  const c = config({
    mode: 'development',
    format: 'umd',
    argv,
  });

  let hasWarnings = false;

  const watcher = rollup.watch({
    ...c.input,
    onwarn({ loc, message }) {
      if (!hasWarnings) {
        clearScreen();
      }
      console.log(
        `${chalk.black.bgYellow(' WARN  ')} ${chalk.yellow(
          loc ? `${loc.file} (${loc.line}:${loc.column}) ${message}` : message
        )}`
      );
      hasWarnings = true;
    },
    output: c.output,
  });

  return new Promise((resolve, reject) => {
    watcher.on('event', (event) => {
      switch (event.code) {
        case 'BUNDLE_START':
          hasWarnings = false;
          clearScreen();
          console.log(`${chalk.black.bgBlue(' INFO  ')}  Compiling...\n`);
          break;
        case 'FATAL':
        case 'ERROR':
          clearScreen();
          console.log(`${chalk.white.bgRed(' ERROR ')} ${chalk.red('Failed to compile\n\n')}`);
          console.error(event.error.stack);
          reject(watcher);
          break;
        case 'BUNDLE_END':
          if (!hasWarnings) {
            clearScreen();
          } else {
            console.log();
          }
          console.log(
            `${chalk.black.bgGreen(' DONE  ')} ${chalk.green(`Compiled successfully in ${event.duration}ms\n`)}`
          );
          resolve(watcher);
          break;
        default:
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
