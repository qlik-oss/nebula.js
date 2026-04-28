/* eslint-disable import/extensions */
import extend from 'extend';
import yargs from 'yargs';
import initConfig from './init-config.js';
import sense from './sense.js';

export default (argv) => {
  // not runnning via command line, run the config to inject default values
  const defaultBuildConfig = initConfig(yargs([])).argv;
  const senseConfig = extend(true, {}, defaultBuildConfig, argv);
  return sense(senseConfig);
};
