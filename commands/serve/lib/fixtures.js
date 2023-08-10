/* eslint-disable no-console */
/**
 * Manages loading and delivering fixtures.
 *
 * Fixtures are transpiled and included when Nebula serve is starting. Fixtures in the specified `--fixturePath` with the extension `.fix.js` are included.
 */
window.serveFixtures = {
  get(key = '') {
    const k = ['/', './'].some((v) => key.startsWith(v)) ? key : `./${key}`;
    let context;
    try {
      // see: https://webpack.js.org/guides/dependency-management/#requirecontext
      context = require.context('fixtures', true, /\.fix\.js$/);
    } catch (_) {
      throw new Error('Specified "--fixturePath" does not exist');
    }

    if (context.keys().includes(k)) {
      return context(k).default;
    }

    console.groupCollapsed(`No fixture found at "${k}"`);
    if (context.keys().length === 0) {
      console.info('No fixtures available.');
    } else {
      console.info('Fixtures available:');
      console.info(context.keys());
      console.info('Is the fixture you are looking for not in the list?');
    }
    console.info(
      'Specify "--fixturePath" to Nebula serve to specify their loction. Note that the fixture\'s file name must end with ".fix.js".'
    );
    console.groupEnd();

    throw new Error(`No fixture found at "${k}"`);
  },
};
