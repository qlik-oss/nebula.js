import fs from 'fs';
import path from 'path';

/**
 * @param {string} [fixturePath] the --fixturePath value, relative to cwd (or absolute)
 * @returns {string} the absolute path of the folder of the fixtures, that may not exist
 */
export const resolveFixturePath = (fixturePath) => path.resolve(process.cwd(), fixturePath || '');

/**
 * Builds the `fixtures` entry for the bundler's `resolve.alias`, as a spreadable object.
 *
 * `lib/fixtures.js` builds a context over this alias with
 * `import.meta.webpackContext('fixtures', …)`, so the target has to resolve at build time.
 *
 * Rspack and webpack disagree about what an unresolvable alias means:
 *
 * - alias present but pointing at a missing directory — rspack reports a build *error*
 *   ("Cannot find module 'fixtures' for matched aliased key"), webpack only warned.
 *   Since rsbuild.serve.js exits on `stats.hasErrors()`, that would stop the dev server
 *   from starting at all whenever --fixturePath doesn't exist — including the default
 *   `test/component` in any project that has no such directory.
 * - alias omitted — both bundlers emit a *warning* ("Module not found: Can't resolve
 *   'fixtures'") and the build succeeds.
 *
 * So the alias is registered only when it actually resolves to a directory. Leaving it out
 * otherwise restores webpack's warn-and-continue behaviour: the server still starts, and
 * fixtures.js's own try/catch reports that the folder does not exist at runtime
 * if a fixture is ever requested.
 *
 * @param {string} [fixturePath] the --fixturePath value, relative to cwd (or absolute)
 * @returns {{fixtures?: string}} spread into `resolve.alias`
 */
export default function fixturesAlias(fixturePath) {
  const resolved = resolveFixturePath(fixturePath);

  if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
    return { fixtures: resolved };
  }

  return {};
}

/**
 * The bundler warns that 'fixtures' can't be resolved when the alias is left out. Like in nebula 7 that is not
 * reported when serve starts, only when a fixture is requested.
 */
export const fixturesIgnoreWarnings = [/Can't resolve 'fixtures'/];
