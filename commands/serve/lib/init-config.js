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
  disableHostCheck: {
    type: 'boolean',
    default: false,
  },
  resources: {
    type: 'string',
    description: 'Path to a folder that will be served as static files under /resources',
  },
  scripts: {
    type: 'array',
    description: 'Array of scripts to inject',
  },
  stylesheets: {
    type: 'array',
    description: 'Array of stylesheets to inject',
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
