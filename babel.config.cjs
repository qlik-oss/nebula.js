const { run } = require('jest');

module.exports = {
  env: {
    test: {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }, '@babel/preset-react']],
      plugins: ['@babel/plugin-transform-react-jsx'],
    },
  },
};
