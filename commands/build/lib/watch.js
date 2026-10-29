/* eslint-disable no-console, import/extensions */
import path from 'path';
import readline from 'readline';
import { createRequire } from 'module';
import chalk from 'chalk';
import { watch as rolldownWatch } from 'rolldown';

import config from './config.js';
import systemjsBehaviours from './systemjs.js';

const require = createRequire(import.meta.url);

const getPackage = (argv, cwd = process.cwd()) => require(path.resolve(argv.cwd || cwd, 'package.json'));

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

// the build of an event is kept open until it is closed, which is of no use to us
const closeResult = (event) => {
  if (event.result) {
    event.result.close();
  }
};

const watch = async (argv) => {
  if (!validateWatchInput(argv)) {
    return undefined;
  }
  const c = getWatchConfig(argv);

  let hasWarnings = false;

  const watcher = rolldownWatch({
    ...c.input,
    onLog(level, log, handler) {
      const { loc, message } = log;
      if (level !== 'warn') {
        handler(level, log);
        return;
      }

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
          closeResult(event);
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
          closeResult(event);
          resolve(watcher);
          break;
        default:
      }
    });
  });
};

export default watch;
