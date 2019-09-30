module.exports = {
  glob: ['./src/**/*.js', '!./src/**/*.spec.js'],
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
