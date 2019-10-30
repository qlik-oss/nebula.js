module.exports = {
  mocha: {
    timeout: 30000,
  },
  mocks: [],
  nyc: {
    exclude: ['**/commands/**'],
  },
};
