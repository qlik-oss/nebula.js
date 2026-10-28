/* eslint-disable no-console */
import chalk from 'chalk';
// eslint-disable-next-line import/no-unresolved -- @rspack/core is resolvable at runtime; the lint resolver doesn't know about it
import { rspack } from '@rspack/core';

const formatWarnings = (stats) => stats.toString({ all: false, warnings: true, colors: false });

/**
 * Run an rspack configuration once and resolve when it is written to disk.
 * Rejects with the compilation errors, the way a failed rollup bundle did.
 */
export const run = (configuration) =>
  new Promise((resolve, reject) => {
    const compiler = rspack(configuration);
    compiler.run((err, stats) => {
      compiler.close(() => {
        if (err) {
          reject(err);
          return;
        }
        if (stats.hasErrors()) {
          reject(new Error(stats.toString({ all: false, errors: true, errorDetails: true, colors: false })));
          return;
        }
        if (stats.hasWarnings()) {
          console.log(`${chalk.black.bgYellow(' WARN  ')} ${chalk.yellow(formatWarnings(stats))}`);
        }
        resolve(stats);
      });
    });
  });

export { formatWarnings };
