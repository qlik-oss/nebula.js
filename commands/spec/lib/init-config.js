/* eslint global-require: 0, no-param-reassign: 0 */
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
  input: {
    type: 'string',
    description: 'Path to TypeScript interface file (e.g., PropertyDef.ts)',
    alias: 'i',
    default: 'src/PropertyDef.ts',
  },
  source: {
    type: 'string',
    description: 'Alias for input (for config file compatibility)',
    hidden: true,
  },
  output: {
    type: 'string',
    description: 'Output directory for generated files',
    alias: 'o',
    default: 'generated',
  },
  interface: {
    type: 'string',
    description: 'Name of the TypeScript interface to generate schema from',
    default: 'ChartProperties',
  },
  projectName: {
    type: 'string',
    description: 'Project name (will be read from package.json if not specified)',
    alias: 'p',
  },
};

module.exports = (yargs) =>
  yargs
    .options(options)
    .config('config', (configPath) => {
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
      return require(configPath).spec || {};
    })
    .example([
      ['$0 spec', 'Generate schema and defaults using default settings'],
      ['$0 spec -i src/MyProps.ts -o dist --interface MyProperties', 'Custom input, output, and interface'],
      ['$0 spec --schema-only', 'Generate only JSON schema'],
      ['$0 spec --defaults-only', 'Generate only defaults file'],
      ['$0 spec -c my-config.js', 'Use custom config file'],
      ['$0 spec -o dist', 'Override config file output directory'],
    ]);
