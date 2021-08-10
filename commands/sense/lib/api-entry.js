const extend = require('extend');
const yargs = require('yargs');
const initConfig = require('./init-config');
const sense = require('./sense');

module.exports = (argv) => {
  // not runnning via command line, run the config to inject default values
  const defaultBuildConfig = initConfig(yargs([])).argv;
  const senseConfig = extend(true, {}, defaultBuildConfig, argv);
  sense(senseConfig);
};
