const path = require('path');
const chalk = require('chalk');
const readline = require('readline');

const extend = require('extend');
const yargs = require('yargs');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const postcss = require('rollup-plugin-postcss');
const replace = require('@rollup/plugin-replace');
const sourcemaps = require('rollup-plugin-sourcemaps');
const jsxPlugin = require('@babel/plugin-transform-react-jsx');
const typescript = require('@rollup/plugin-typescript');
const json = require('@rollup/plugin-json');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

const babelPreset = require('@babel/preset-env');

const { terser } = require('rollup-plugin-terser');

const initConfig = require('./init-config');

const resolveReplacementStrings = (replacementStrings) => {
  if (typeof replacementStrings !== 'object') {
    throw new Error('replacementStrings should be an object with key value pairs of strings!');
  }
  return replacementStrings;
};

const config = ({
  mode = 'production',
  format = 'umd',
  cwd = process.cwd(),
  argv = { sourcemap: true },
  core,
} = {}) => {
  const CWD = argv.cwd || cwd;
  let dir = CWD;
  let pkg = require(path.resolve(CWD, 'package.json')); // eslint-disable-line
  const corePkg = core ? require(path.resolve(core, 'package.json')) : null; // eslint-disable-line
  const { name, version, license, author } = pkg;
  const { sourcemap, replacementStrings = {} } = argv;

  if (corePkg) {
    pkg = corePkg;
    dir = core;
  }

  if (format === 'esm' && !pkg.module) {
    return false;
  }

  const fileTarget = format === 'esm' ? pkg.module : pkg.main;

  const auth = typeof author === 'object' ? `${author.name} <${author.email}>` : author || '';
  const moduleName = name.split('/').reverse()[0];
  const extensions = ['.mjs', '.js', '.jsx', '.json', '.node', '.tsx', '.ts'];

  const banner = `/*
* ${name} v${version}
* Copyright (c) ${new Date().getFullYear()} ${auth}
* Released under the ${license} license.
*/
`;

  const peers = pkg.peerDependencies || {};
  const external = Object.keys(peers);

  // stardust should always be external
  if (!peers['@nebula.js/stardust']) {
    console.warn('@nebula.js/stardust should be specified as a peer dependency');
  } else if (external.indexOf('@nebula.js/stardust') === -1) {
    external.push('@nebula.js/stardust');
  }

  return {
    input: {
      input: path.resolve(CWD, 'src/index'),
      external,
      plugins: [
        replace({
          'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
          preventAssignment: true,
          ...resolveReplacementStrings(replacementStrings),
        }),
        nodeResolve({
          extensions,
        }),
        commonjs(),
        json(),
        babel({
          babelrc: false,
          inputSourceMap: false, // without this you get wrong source maps, but I don't know why
          extensions,
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
          plugins: [[jsxPlugin]],
        }),
        sourcemaps(),
        postcss({}),
        typescript(),
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
      file: path.resolve(dir, fileTarget), // fileTargetformat === 'esm' && pkg.module ? pkg.module : pkg.main,
      name: moduleName,
      sourcemap,
      globals: {
        '@nebula.js/stardust': 'stardust',
      },
    },
  };
};

const minified = async (argv) => {
  const c = config({
    mode: argv.mode || 'production',
    format: 'umd',
    argv,
  });
  const bundle = await rollup.rollup(c.input);
  await bundle.write(c.output);
};

const esm = async (argv, core) => {
  const c = config({
    mode: argv.mode || 'development',
    format: 'esm',
    argv,
    core,
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
    mode: argv.mode || 'development',
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
    const yargsArgs = argv.config ? ['--config', argv.config] : [];
    defaultBuildConfig = initConfig(yargs(yargsArgs)).argv;
  }

  const buildConfig = extend(true, {}, defaultBuildConfig, argv);
  if (buildConfig.watch) {
    return watch(buildConfig);
  }
  await minified(buildConfig);

  if (argv.core) {
    const core = path.resolve(process.cwd(), argv.core);
    await esm(buildConfig, core);
  }
  return esm(buildConfig);
}

module.exports = build;
