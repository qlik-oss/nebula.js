const path = require('path');
const extend = require('extend');
const yargs = require('yargs');
const rollup = require('rollup');

const initConfig = require('./init-config');
const config = require('./config');
const watch = require('./watch');
const systemjsBehaviours = require('./systemjs');

const umd = async (argv) => {
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
  const bundle = await rollup.rollup(c.input);
  return bundle.write(c.output);
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
  const bundle = await rollup.rollup(c.input);
  return bundle.write(c.output);
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

  console.time('umd');
  await umd(buildConfig);
  console.timeEnd('umd');
  console.time('esm');
  await esm(buildConfig);
  console.timeEnd('esm');
  console.time('systemjs');
  argv.systemjs && (await systemjs(buildConfig));
  console.timeEnd('systemjs');

  console.time('esm core');
  if (argv.core) {
    const core = path.resolve(process.cwd(), argv.core);
    await esm(buildConfig, core);
  }
  console.timeEnd('esm core');

  return undefined;
}

module.exports = build;
