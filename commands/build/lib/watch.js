/* eslint-disable no-console, import/extensions */
import path from 'path';
import readline from 'readline';
import { EventEmitter } from 'events';
import { createRequire } from 'module';
import chalk from 'chalk';
// eslint-disable-next-line import/no-unresolved -- @rspack/core is resolvable at runtime; the lint resolver doesn't know about it
import { rspack } from '@rspack/core';

import config from './config.js';
import systemjsBehaviours from './systemjs.js';
import { formatWarnings } from './compile.js';

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

/**
 * Watch the sources and rebuild on change.
 *
 * Resolves with a watcher after the first successful build. The watcher has the surface the rollup
 * watcher had, which `nebula serve` depends on: `close()` and `on('event', fn)` with events shaped
 * `{ code: 'BUNDLE_START' | 'BUNDLE_END' | 'ERROR', ... }`.
 */
const watch = async (argv) => {
  if (!validateWatchInput(argv)) {
    return undefined;
  }
  const c = getWatchConfig(argv);

  const events = new EventEmitter();
  const compiler = rspack(c);
  let watching;

  const watcher = {
    on: (name, listener) => {
      events.on(name, listener);
      return watcher;
    },
    close: () =>
      new Promise((resolve) => {
        if (!watching) {
          compiler.close(resolve);
          return;
        }
        watching.close(() => compiler.close(resolve));
      }),
  };

  return new Promise((resolve, reject) => {
    let settled = false;
    const settle = (fn, value) => {
      if (!settled) {
        settled = true;
        fn(value);
      }
    };

    compiler.hooks.watchRun.tap('nebula build', () => {
      clearScreen();
      console.log(`${chalk.black.bgBlue(' INFO  ')}  Compiling...\n`);
      events.emit('event', { code: 'BUNDLE_START' });
    });

    watching = compiler.watch({}, (err, stats) => {
      const failure =
        err ||
        (stats.hasErrors() &&
          new Error(stats.toString({ all: false, errors: true, errorDetails: true, colors: false })));
      if (failure) {
        clearScreen();
        console.log(`${chalk.white.bgRed(' ERROR ')} ${chalk.red('Failed to compile\n\n')}`);
        console.error(failure.stack);
        events.emit('event', { code: 'ERROR', error: failure });
        settle(reject, watcher);
        return;
      }

      const hasWarnings = stats.hasWarnings();
      if (hasWarnings) {
        console.log(`${chalk.black.bgYellow(' WARN  ')} ${chalk.yellow(formatWarnings(stats))}`);
        console.log();
      } else {
        clearScreen();
      }
      const duration = stats.endTime - stats.startTime;
      console.log(`${chalk.black.bgGreen(' DONE  ')} ${chalk.green(`Compiled successfully in ${duration}ms\n`)}`);
      events.emit('event', { code: 'BUNDLE_END', duration });
      settle(resolve, watcher);
    });
  });
};

export default watch;
