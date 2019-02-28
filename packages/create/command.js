const path = require('path');
const execa = require('execa');

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
  },
  async handler(argv) {
    const generator = path.resolve(__dirname, 'generator/index.js');
    const args = `${argv.name} ${!argv.install ? '--no-install' : ''} ${argv.pkgm ? `--pkgm ${argv.pkgm}` : ''}`;
    try {
      execa.shell(`yo ${generator} ${args} --no-insight`, {
        localDir: path.resolve(__dirname, 'node_modules', '.bin'),
        preferLocal: true,
        stdio: 'inherit',
      });
    } catch (err) {
      console.error(err);
    }
  },
};
