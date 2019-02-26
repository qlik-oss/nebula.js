const serve = require('./serve');

module.exports = {
  command: 'serve',
  desc: 'Dev server',
  builder(yargs) {
    yargs.option('build', {
      type: 'boolean',
      default: true,
    });
    yargs.option('host', {
      type: 'string',
    });
    yargs.option('port', {
      type: 'number',
    });
    yargs.option('enigma.host', {
      type: 'string',
    });
    yargs.option('enigma.port', {
      type: 'port',
      default: 9076,
    });
  },
  handler(argv) {
    serve(argv);
  },
};
