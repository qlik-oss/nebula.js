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
      choices: ['unit'],
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

const TYPES = {
  unit: {
    glob: `${argv.scope}/__tests__/unit/**/*.spec.js`,
    reportDir: 'coverage/unit',
  },
};

const type = TYPES[argv.type];

const glob = [type.glob];
const src = [`${argv.scope}/src/**/*.{js,jsx}`];

module.exports = {
  glob,
  src,
  watchGlob: [...src, ...glob],
  nyc: {
    include: src,
    sourceMap: false,
    instrumenter: './lib/instrumenters/noop',
    reportDir: 'coverage/unit',
  },
  mocha: Object.assign({
    timeout: 30000,
  }, type.mocha),
};
