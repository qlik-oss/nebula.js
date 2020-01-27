module.exports = {
  glob: ['./src/**/*.js', '!./src/**/*.spec.js', '!./src/hooks/useObjectSelections.js'],
  api: {
    stability: 'experimental',
    properties: {
      'x-qlik-visibility': 'public',
    },
    visibility: 'public',
  },
  output: {
    file: './spec/spec.json',
  },
  parse: {
    types: {},
  },
};
