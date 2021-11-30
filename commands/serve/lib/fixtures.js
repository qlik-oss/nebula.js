/**
 * Manages loading and delivering fixtures.
 *
 * Fixtures are transpiled and included when Nebula serve is starting. Fixtures in the specified `--fixturePath` with the extension `.fix.js` are included.
 */
window.serveFixtures = {
  get(key = '') {
    const k = key.startsWith('./') ? key : `./${key}`;
    try {
      // see: https://webpack.js.org/guides/dependency-management/#requirecontext
      const context = require.context('fixtures', true, /\.fix\.js$/);
      return context(k).default;
    } catch (_) {
      return () => console.log(`No fixture found at "${k}". Specify "--fixturePath" to Nebula serve ?`);
    }
  },
};
