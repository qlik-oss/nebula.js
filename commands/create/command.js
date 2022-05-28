const create = require('./lib/create');

const mashup = {
  command: 'mashup <name>',
  desc: 'Create a mashup',
  builder(yargs) {
    yargs.positional('name', {
      type: 'string',
      description: 'name of the project',
    });
  },
  handler(argv) {
    create(argv);
  },
};

module.exports = {
  command: 'create <name>',
  desc: 'Create a visualization',
  builder(yargs) {
    yargs.command(mashup);

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
  handler(argv) {
    create(argv);
  },
};
