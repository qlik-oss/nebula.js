import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {string} [fixturePath] the --fixturePath value, relative to cwd (or absolute)
 * @returns {string} the absolute path of the folder of the fixtures, that may not exist
 */
export const resolveFixturePath = (fixturePath) => path.resolve(process.cwd(), fixturePath || '');

const isDirectory = (resolved) => fs.existsSync(resolved) && fs.statSync(resolved).isDirectory();

/**
 * The module that puts `window.serveFixtures` on the page. Only the one that builds a context over the `fixtures`
 * alias asks the bundler to resolve it, so that is left out when there is no folder to alias: nothing is then
 * reported when serve starts, like in nebula 7, and the one that is used instead reports it when a fixture is requested.
 *
 * @param {string} [fixturePath] the --fixturePath value, relative to cwd (or absolute)
 * @returns {string} the absolute path of the module
 */
export const fixturesEntry = (fixturePath) =>
  path.resolve(moduleDir, isDirectory(resolveFixturePath(fixturePath)) ? './fixtures.js' : './no-fixtures.js');

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
 * So the alias is registered only when it actually resolves to a directory, and `fixturesEntry`
 * then leaves out the module that asks for it.
 *
 * @param {string} [fixturePath] the --fixturePath value, relative to cwd (or absolute)
 * @returns {{fixtures?: string}} spread into `resolve.alias`
 */
export default function fixturesAlias(fixturePath) {
  const resolved = resolveFixturePath(fixturePath);

  if (isDirectory(resolved)) {
    return { fixtures: resolved };
  }

  return {};
}
