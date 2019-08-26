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
    yargs.option('minify', {
      type: 'boolean',
      required: false,
      default: true,
      desc: 'Minify and uglify code',
    });
  },
  handler(argv) {
    build(argv);
  },
};
