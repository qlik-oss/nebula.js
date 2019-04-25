/* eslint import/no-extraneous-dependencies: 0, prefer-destructuring: 0, no-param-reassign: 0 */

const yargs = require('yargs');
const path = require('path');
const globby = require('globby');
const { workspaces } = require('./package.json');

const argv = yargs
  .options({
    scope: {
      description: 'Scope to package',
      type: 'string',
      default: '',
      alias: 's',
    },
    type: {
      description: 'Type of tests to run',
      type: 'string',
      alias: 't',
      default: 'unit',
      choices: ['unit', 'integration'],
    },
  })
  .coerce('scope', (scope) => {
    const scopes = new Map();
    globby.sync(workspaces.map(p => `${p}/package.json`)).forEach((p) => {
      const name = require(`./${p}`).name; //eslint-disable-line
      const pkgPath = path.dirname(p);
      scopes.set(name, pkgPath);
    });
    const s = scopes.get(scope);
    if (s) {
      return s;
    }
    if (scope && !s) {
      throw new Error(`Scope ${scope} not found`);
    }
    return `*(${workspaces.join('|').split('/*').join('')})/*`;
  })
  .argv;

const CONFIGS = {
  unit: {
    glob: [`${argv.scope}/__tests__/unit/**/*.spec.{js,jsx}`, `${argv.scope}/src/**/__tests__/**/*.spec.{js,jsx}`],
    src: [`${argv.scope}/src/**/*.{js,jsx}`],
    coverage: true,
    nyc: {
      include: [`${argv.scope}/src/**/*.{js,jsx}`],
      exclude: ['**/*.spec.{js,jsx}'],
      sourceMap: false,
      instrumenter: './lib/instrumenters/noop',
      reportDir: 'coverage/unit',
    },
    mocks: [
      ['**/*.scss', '{}'],
      ['**/*.css', '{}'],
      ['**/styled.js', () => () => ['classes']],

      // mock nebula modules to avoid parsing errors without build.
      // these modules should be mocked properly in the unit test
      ['@nebula.js/selections', () => ({})],
      ['@nebula.js/supernova', () => ({})],
      ['@nebula.js/nucleus', () => ({})],
    ],
  },
  integration: {
    glob: 'test/integration/**/*.spec.js',
    watchGlob: ['test/integration/**/*.{js,html}'],
  },
};

const config = CONFIGS[argv.type];

module.exports = {
  watchGlob: [config.src, config.glob],
  mocha: {
    timeout: 30000,
  },
  ...config,
};
