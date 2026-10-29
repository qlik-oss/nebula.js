/* eslint-disable no-console, import/extensions */
import path from 'path';
import extend from 'extend';
import yargs from 'yargs';
import { rolldown } from 'rolldown';

import initConfig from './init-config.js';
import config from './config.js';
import watch from './watch.js';
import systemjsBehaviours from './systemjs.js';

const write = async ({ input, output }) => {
  const bundle = await rolldown(input);
  try {
    return await bundle.write(output);
  } finally {
    await bundle.close();
  }
};

const umd = async (argv) => {
  const c = config({
    mode: argv.mode || 'production',
    format: 'umd',
    argv,
  });
  await write(c);
};

const esm = async (argv, core) => {
  const c = config({
    mode: argv.mode || 'production',
    format: 'esm',
    argv,
    core,
    behaviours: {
      getOutputFile: ({ pkg }) => pkg.module,
      enabled: ({ pkg }) => !!pkg.module,
    },
  });
  if (!c) {
    return undefined;
  }
  return write(c);
};

const systemjs = async (argv) => {
  const c = config({
    mode: argv.mode || 'production',
    format: 'systemjs',
    argv,
    behaviours: systemjsBehaviours,
  });
  if (!c) {
    return undefined;
  }
  return write(c);
};

async function build(argv = {}) {
  let defaultBuildConfig = {};

  // if not running via command line, run the config to inject default values
  if (!argv.$0) {
    const yargsArgs = argv.config ? ['--config', argv.config] : [];
    defaultBuildConfig = initConfig(yargs(yargsArgs)).argv;
  }

  const buildConfig = extend(true, {}, defaultBuildConfig, argv);
  if (buildConfig.watch) {
    return watch(buildConfig);
  }
  console.time('Total build time');
  console.time('Generate UMD bundle');
  await umd(buildConfig);
  console.timeEnd('Generate UMD bundle');
  console.time('Create ESM bundle');
  await esm(buildConfig);
  console.timeEnd('Create ESM bundle');

  if (buildConfig.systemjs) {
    console.time('Support native format of the SystemJS loader');
    await systemjs(buildConfig);
    console.timeEnd('Support native format of the SystemJS loader');
  }

  if (buildConfig.core) {
    console.time('Create ESM bundle into core');
    const core = path.resolve(process.cwd(), buildConfig.core);
    await esm(buildConfig, core);
    console.timeEnd('Create ESM bundle into core');
  }
  console.timeEnd('Total build time');

  return undefined;
}

export default build;
