/* eslint global-require: 0 */

const fs = require('fs');

const defaultFilename = 'nebula.config.js';
const RX = new RegExp(`${defaultFilename.replace(/\./g, '\\.')}$`);

const options = {
  config: {
    type: 'string',
    description: 'Path to a JavaScript config file',
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
    description: 'Build the nebula visualization into /dist dictionary',
    default: true,
  },
  host: {
    type: 'string',
    description: 'Specify a host to use',
    default: 'localhost',
  },
  port: {
    type: 'number',
    description: 'Specify a port number to listen for requests on',
  },
  disableHostCheck: {
    type: 'boolean',
    description: 'Bypasses host checking',
    default: false,
  },
  keyboardNavigation: {
    type: 'boolean',
    description: 'Whether or not Nebula handles keyboard navigation',
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
    description: 'Set host to communicate with Qlik QIX Engine',
    default: 'localhost',
  },
  'enigma.port': {
    type: 'number',
    description: 'Set port to communicate with Qlik QIX Engine',
    default: 9076,
  },
  clientId: {
    type: 'string',
    description: "Tenant's clientId for OAuth connection",
  },
  webIntegrationId: {
    type: 'string',
    description: "Tenant's webIntegrationId for connection",
  },
  fixturePath: {
    type: 'string',
    description: 'Path to a folder that will be used as basis when locating fixtures',
    default: 'test/component',
  },
  mfe: {
    type: 'boolean',
    description: 'Serves bundle to use in micro frontend',
    default: false,
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
    return require(configPath).serve || {};
  });
