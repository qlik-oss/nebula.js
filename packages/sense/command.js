const build = require('./lib/build');

module.exports = {
  command: 'sense',
  desc: 'Build a supernova as a Qlik Sense extension',
  builder(yargs) {
    yargs.option('ext', {
      type: 'string',
      required: false,
      desc: 'Extension definition',
    });
    yargs.option('meta', {
      type: 'string',
      required: false,
      desc: 'Extension meta information',
    });
  },
  handler(argv) {
    build(argv);
  },
};
