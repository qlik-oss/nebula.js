import chalk from 'chalk';
import { createRslib } from '@rslib/core';

const formatWarnings = (stats) => stats.toString({ all: false, warnings: true, colors: false });

const formatErrors = (stats) => stats.toString({ all: false, errors: true, errorDetails: true, colors: false });

/**
 * Rslib with what a build of nebula needs: it prints nothing itself, the stats of the compilations are
 * handed to `onCompile` and the build is started with the plugin of `hooks`.
 */
const create = async ({ cwd, config }, hooks = () => {}) => {
  // rsbuild takes its mode, and the NODE_ENV it defines, from the environment and not from `config.mode`
  process.env.NODE_ENV = config.mode;
  return createRslib({
    cwd,
    config: {
      ...config,
      logLevel: 'silent',
      plugins: [{ name: 'nebula-build', setup: hooks }],
    },
  });
};

/**
 * Run a build once and resolve when it is written to disk.
 * Rejects with the compilation errors, the way a failed rollup bundle did.
 */
export const run = async (build) => {
  let stats;
  const rslib = await create(build, (api) => {
    api.onAfterBuild((result) => {
      stats = result.stats;
    });
  });
  try {
    await rslib.build();
  } catch (e) {
    throw stats && stats.hasErrors() ? new Error(formatErrors(stats)) : e;
  }
  if (stats && stats.hasWarnings()) {
    console.log(`${chalk.black.bgYellow(' WARN  ')} ${chalk.yellow(formatWarnings(stats))}`);
  }
  return stats;
};

export { create, formatWarnings, formatErrors };
