/**
 * Manage loading and delivering fixtures.
 *
 * Fixtures are transpiled and included when nebula serve is starting. Fixtures in the specified `fixturePath` with the extension `.fix.js` are included.
 */

window.fixtures = {
  get(key = '') {
    // const info = await serverInfo;
    // see: https://webpack.js.org/guides/dependency-management/#requirecontext
    const k = key.startsWith('./') ? key : `./${key}`;
    try {
      const context = require.context('fixtures', true, /\.fix\.js$/);
      // context.keys().forEach(console.log);
      return context(k).default;
    } catch (_) {
      return () => console.log(`No fixture found at "${k}". Specify "--fixturePath" to nebula serve ?`);
    }
  },
};
