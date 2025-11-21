const spec = require('./lib/spec');
const initConfig = require('./lib/init-config');

module.exports = {
  command: 'spec',
  desc: 'Generate TypeScript interfaces and JSON schemas from property definitions',
  builder(yargs) {
    initConfig(yargs).argv;
  },
  handler(argv) {
    spec(argv);
  },
};
