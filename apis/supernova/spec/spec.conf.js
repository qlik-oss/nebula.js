module.exports = {
  glob: [
    './src/**/*.js',
    '!./src/**/*.spec.js',
    '../nucleus/src/hooks/useObjectSelections.js',
    '../locale/src/translator.js',
    '../theme/src/**/*.js',
  ],
  api: {
    stability: 'experimental',
  },
  output: {
    file: './spec/spec.json',
  },
  parse: {
    types: {},
  },
};
