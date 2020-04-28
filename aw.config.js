module.exports = {
  mocha: {
    timeout: 30000,
  },
  mocks: [],
  nyc: {
    exclude: [
      '**/commands/**',
      '**/__stories__/**',
      '**/apis/nucleus/index.js',
      '**/apis/locale/index.js',
      '**/apis/stardust/index.js',
      '**/apis/supernova/index.js',
      '**/apis/theme/index.js',
      '**/apis/test-utils/index.js',
      '**/packages/ui/icons/**/*.js', // Exclude the defined icons but test the `<SvgIcon />`
    ],
  },
};

global.__NEBULA_DEV__ = false; // eslint-disable-line
