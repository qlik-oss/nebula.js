module.exports = {
  mocha: {
    timeout: 30000,
  },
  mocks: [],
  nyc: {
    exclude: ['**/commands/**', '**/__stories__/**', '**/apis/supernova/index.js', '**/apis/nucleus/index.js'],
  },
};

global.__NEBULA_DEV__ = false; // eslint-disable-line
