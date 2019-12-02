const runFixture = key => {
  // const info = await serverInfo;
  // see: https://webpack.js.org/guides/dependency-management/#requirecontext
  try {
    const context = require.context('fixtures', true, /\.fix\.js$/);
    // context.keys().forEach(console.log);
    return context(key).default;
  } catch (_) {
    return () => console.log('No fixtures found in test/component');
  }
};

export default runFixture;
