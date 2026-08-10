import fs from 'fs';
import path from 'path';

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
 *   Since rspack.serve.js exits on `stats.hasErrors()`, that would stop the dev server
 *   from starting at all whenever --fixturePath doesn't exist — including the default
 *   `test/component` in any project that has no such directory.
 * - alias omitted — both bundlers emit a *warning* ("Module not found: Can't resolve
 *   'fixtures'") and the build succeeds.
 *
 * So the alias is registered only when it actually resolves to a directory. Leaving it out
 * otherwise restores webpack's warn-and-continue behaviour: the server still starts, and
 * fixtures.js's own try/catch reports 'Specified "--fixturePath" does not exist' at runtime
 * if a fixture is ever requested.
 *
 * @param {string} [fixturePath] the --fixturePath value, relative to cwd (or absolute)
 * @returns {{fixtures?: string}} spread into `resolve.alias`
 */
export default function fixturesAlias(fixturePath) {
  const resolved = path.resolve(process.cwd(), fixturePath || '');
  const exists = fs.existsSync(resolved);

  if (exists && fs.statSync(resolved).isDirectory()) {
    return { fixtures: resolved };
  }

  // `stats: 'errors-only'` hides the bundler's own "Module not found" warning in serve's
  // production mode, so say it out loud — a mistyped --fixturePath should not look like
  // everything is fine.
  // eslint-disable-next-line no-console
  console.warn(
    `nebula serve: fixture path "${fixturePath}" ${exists ? 'is not a directory' : 'does not exist'} ` +
      `(resolved to ${resolved}). Fixtures will be unavailable.`
  );

  return {};
}
