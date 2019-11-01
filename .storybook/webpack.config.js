module.exports = ({ config }) => {
  const jsRule = config.module.rules.find(rule => rule.test.test('.js'));
  jsRule.exclude = /node_modules/;

  return config;
};
