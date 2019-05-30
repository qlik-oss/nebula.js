const create = require('./lib');

module.exports = {
  command: 'create <name>',
  desc: 'Create a supernova',
  builder(yargs) {
    yargs.positional('name', {
      type: 'string',
      description: 'name of the project',
    });
    yargs.option('install', {
      type: 'boolean',
      default: true,
      description: 'Run package installation step',
    });
    yargs.option('pkgm', {
      type: 'string',
      choices: ['npm', 'yarn'],
      description: 'Package manager',
    });
    yargs.option('picasso', {
      type: 'string',
      choices: ['none', 'minimal', 'barchart'],
      description: 'Picasso template',
    });
    yargs.option('author', {
      type: 'string',
      description: 'Package author',
    });
  },
  async handler(argv) {
    create(argv);
  },
};
