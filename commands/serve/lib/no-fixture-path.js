/* eslint-disable no-console */
/**
 * Stands in for fixtures.js when there is no `--fixturePath`, so there is nothing to build a context over. Reports what
 * could not be loaded when a fixture is requested.
 */
window.serveFixtures = {
  get(key = '') {
    const error = new Error(`Unable to load fixture "${key}": no --fixturePath configured`);
    console.error(error.message);
    throw error;
  },
};
