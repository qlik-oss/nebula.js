const serve = require('./lib/serve');

module.exports = {
  command: 'serve',
  desc: 'Dev server',
  builder(yargs) {
    yargs
      .option('entry', {
        type: 'string',
        description: 'File entrypoint',
      })
      .option('type', {
        type: 'string',
        description: 'Generic object type',
      })
      .option('build', {
        type: 'boolean',
        default: true,
      })
      .option('host', {
        type: 'string',
      })
      .option('port', {
        type: 'number',
      })
      .option('enigma.host', {
        type: 'string',
      })
      .option('enigma.port', {
        type: 'port',
        default: 9076,
      })
      .option('ACCEPT_EULA', {
        type: 'boolean',
        alias: 'a',
        default: false,
      }).argv;
  },
  handler(argv) {
    serve(argv);
  },
};
