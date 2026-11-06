import path from 'path';
import readline from 'readline';
import { EventEmitter } from 'events';
import { createRequire } from 'module';
import chalk from 'chalk';

import config from './config.js';
import systemjsBehaviours from './systemjs.js';
import { create, formatErrors, formatWarnings } from './compile.js';

const require = createRequire(import.meta.url);

const getPackage = (argv, cwd = process.cwd()) => require(path.resolve(argv.cwd || cwd, 'package.json'));

// the field of package.json that has the output file of a format
const OUTPUT_FIELDS = { systemjs: 'systemjs', esm: 'module' };

const validateWatchInput = (argv) => {
  const field = OUTPUT_FIELDS[argv.watch];
  if (field && !getPackage(argv)[field]) {
    console.log(
      `${chalk.white.bgRed(' ERROR ')} ${chalk.red(`No "${field}" field specifying output file found in package.json`)}`
    );
    return false;
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
    case 'esm':
      opts = {
        ...base,
        format: 'esm',
        behaviours: {
          getOutputFile: ({ pkg }) => pkg.module,
          // the modules that the host of the bundle has, the peer dependencies of the package when it is not told
          getExternal: ({ pkg, config: cfg }) => cfg.external || Object.keys(pkg.peerDependencies || {}),
        },
      };
      break;
    default:
      throw new Error(`Cannot watch '${argv.watch}', watch esm or systemjs`);
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
  let closeWatch;

  const watcher = {
    on: (name, listener) => {
      events.on(name, listener);
      return watcher;
    },
    close: async () => {
      if (closeWatch) {
        await closeWatch();
      }
    },
  };

  return new Promise((resolve, reject) => {
    let settled = false;
    const settle = (fn, value) => {
      if (!settled) {
        settled = true;
        fn(value);
      }
    };

    const rslibPromise = create(c, (api) => {
      api.onBeforeBuild(() => {
        clearScreen();
        console.log(`${chalk.black.bgBlue(' INFO  ')}  Compiling...\n`);
        events.emit('event', { code: 'BUNDLE_START' });
      });

      api.onAfterBuild(({ stats }) => {
        if (stats.hasErrors()) {
          const failure = new Error(formatErrors(stats));
          clearScreen();
          console.log(`${chalk.white.bgRed(' ERROR ')} ${chalk.red('Failed to compile\n\n')}`);
          console.error(failure.stack);
          events.emit('event', { code: 'ERROR', error: failure });
          settle(reject, watcher);
          return;
        }

        if (stats.hasWarnings()) {
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

    rslibPromise
      .then((rslib) => rslib.build({ watch: true }))
      .then((result) => {
        closeWatch = result && result.close;
      })
      .catch((e) => {
        // a failed compile is reported by the hook above
        if (!settled) {
          settle(reject, e);
        }
      });
  });
};

export default watch;
