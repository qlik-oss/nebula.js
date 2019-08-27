const { build } = require('./build');

module.exports = {
  command: 'build',
  desc: 'Build supernova',
  builder(yargs) {
    yargs.option('watch', {
      type: 'boolean',
      alias: 'w',
      default: false,
    });
  },
  handler(argv) {
    build(argv);
  },
};
