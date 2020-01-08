module.exports = {
  mocha: {
    timeout: 30000,
  },
  mocks: [],
  nyc: {
    exclude: ['**/commands/**', '**/__stories__/**'],
  },
};

global.__NEBULA_DEV__ = false; // eslint-disable-line
