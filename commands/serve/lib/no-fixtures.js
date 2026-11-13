/* eslint-disable no-console */
/**
 * Stands in for fixtures.js when the folder of `--fixturePath` does not exist, so there is nothing to build a context
 * over. Reports what could not be loaded when a fixture is requested, the log of nebula serve says where it looked.
 */
window.serveFixtures = {
  get(key = '') {
    const error = new Error(
      `Unable to load fixture "${key}" from the configured --fixturePath: the folder does not exist`
    );
    console.error(error.message);
    throw error;
  },
};
