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
  entry: {
    type: 'string',
    description: 'File entrypoint',
  },
  type: {
    type: 'string',
    description: 'Generic object type',
  },
  build: {
    type: 'boolean',
    default: true,
  },
  host: {
    type: 'string',
    default: 'localhost',
  },
  port: {
    type: 'number',
  },
  'enigma.host': {
    type: 'string',
    default: 'localhost',
  },
  'enigma.port': {
    type: 'number',
    default: 9076,
  },
  webIntegrationId: {
    type: 'string',
  },
  ACCEPT_EULA: {
    type: 'boolean',
    default: false,
  },
};

module.exports = yargs =>
  yargs.options(options).config('config', configPath => {
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
    return require(configPath).serve;
  });
