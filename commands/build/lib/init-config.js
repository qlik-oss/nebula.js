/* eslint global-require: 0 */
const fs = require('fs');

const defaultFilename = 'nebula.config.js';
const RX = new RegExp(`${defaultFilename.replace(/\./g, '\\.')}$`);

const options = {
  config: {
    type: 'string',
    description: 'Path to config file',
    default: defaultFilename,
    alias: 'c',
  },
  watch: {
    description: 'Watch source files',
    type: 'boolean',
    alias: 'w',
    default: false,
  },
  sourcemap: {
    description: 'Generate source map',
    type: 'boolean',
    alias: 'm',
    default: true,
  },
  mode: {
    description: 'Explicitly set mode ("developer"|"production")',
    type: 'string',
    default: undefined,
  },
};

module.exports = (yargs) =>
  yargs.options(options).config('config', (configPath) => {
    if (configPath === null) {
      return {};
    }
    if (!fs.existsSync(configPath)) {
      if (RX.test(configPath)) {
        // do nothing if default filename doesn't exist
        return {};
      }
      throw new Error(`Config ${configPath} not found`);
    }
    return require(configPath).build;
  });
