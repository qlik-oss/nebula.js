/* eslint-disable no-console */
/* global __NEBULA_FIXTURE_DIR__ */
/**
 * Stands in for fixtures.js when the folder of `--fixturePath` does not exist, so there is nothing to build a context
 * over. Reports what could not be loaded when a fixture is requested.
 */
window.serveFixtures = {
  get(key = '') {
    const file = `${__NEBULA_FIXTURE_DIR__}/${key.replace(/^\.?\//, '')}`;
    const error = new Error(
      `Unable to load fixture ${file}: the folder of "--fixturePath" does not exist (${__NEBULA_FIXTURE_DIR__})`
    );
    console.error(error.message);
    throw error;
  },
};
