import { builtinModules } from 'module';

/**
 * The `resolve` options that make an empty module of every node builtin.
 *
 * A builtin is never a dependency of a bundle. Library code that reaches for one in a path of its own for node
 * (random-js and @qlik/api do, with require('crypto') and import('fs')) would otherwise make a host that loads the
 * bundle look for it. A package of the same name that is installed is used instead.
 */
export default {
  fallback: Object.fromEntries(builtinModules.map((name) => [name, false])),
  alias: Object.fromEntries(builtinModules.map((name) => [`node:${name}`, false])),
};
