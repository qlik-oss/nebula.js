/**
 * Manage loading and delivering fixtures.
 *
 * Fixtures are transpiled and included when nebula serve is starting. Fixtures in the specified `fixturePath` with the extension `.fix.js` are included.
 */

window.fixtures = {
  get(key) {
    // const info = await serverInfo;
    // see: https://webpack.js.org/guides/dependency-management/#requirecontext
    try {
      const context = require.context('fixtures', true, /\.fix\.js$/);
      // context.keys().forEach(console.log);
      return context(key).default;
    } catch (_) {
      return () => console.log('No fixtures found in test/component');
    }
  },
};
