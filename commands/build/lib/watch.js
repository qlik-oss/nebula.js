const chalk = require('chalk');
const path = require('path');
const rollup = require('rollup');
const readline = require('readline');

const config = require('./config');
const systemjsBehaviours = require('./systemjs');

const getPackage = (argv, cwd = process.cwd()) => require(path.resolve(argv.cwd || cwd, 'package.json')); // eslint-disable-line

const validateWatchInput = (argv) => {
  if (argv.watch === 'systemjs') {
    const pkg = getPackage(argv);
    if (!pkg.systemjs) {
      console.log(
        `${chalk.white.bgRed(' ERROR ')} ${chalk.red(
          'No "systemjs" field specifying output file found in package.json'
        )}`
      );
      return false;
    }
  }
  return true;
};

const getWatchConfig = (argv) => {
  const base = {
    mode: argv.mode || 'development',
    argv,
  };

  let opts;

  switch (argv.watch) {
    case 'systemjs':
      opts = { ...base, format: 'systemjs', behaviours: systemjsBehaviours };
      break;
    case 'umd':
    default:
      opts = { ...base, format: 'umd' };
      break;
  }
  return config(opts);
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
  if (!validateWatchInput(argv)) {
    return undefined;
  }
  const c = getWatchConfig(argv);

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

module.exports = watch;
