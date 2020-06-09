const build = require('./lib/build');

const init = require('./lib/init-config');

module.exports = {
  command: 'build',
  desc: 'Build visualization',
  builder(yargs) {
    init(yargs).argv;
  },
  handler(argv) {
    build(argv);
  },
};
