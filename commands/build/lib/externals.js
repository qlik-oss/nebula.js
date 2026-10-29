import { builtinModules } from 'module';

const BUILTINS = new Set([...builtinModules, ...builtinModules.map((name) => `node:${name}`)]);

export const isBuiltin = (id) => BUILTINS.has(id);

/**
 * Whether an id is listed as external. Like Rollup, a string only matches the exact id and a regular expression is
 * tested against it.
 * @param {Array<string | RegExp>} external
 * @param {string} id
 */
export const isExternal = (external, id) => external.some((e) => (e instanceof RegExp ? e.test(id) : e === id));

const BUILTIN_PREFIX = '\0nebula-builtin:';

// A module that is the node builtin where there is a `require` to read it with, and an empty module elsewhere.
// It is evaluated when the code that uses the builtin is, and never fails: a library may reach for a builtin in a
// code path of its own for node, that is not run in a browser. `require` is called through a variable that is not an alias of it,
// so that a bundler that reads our bundle does not take the call for a dependency of this module.
const builtinModule = (name) => `var read = typeof require === 'function' ? [require][0] : null;
module.exports = (function builtin() {
  try {
    return read ? read(${JSON.stringify(name)}) : {};
  } catch (e) {
    return {};
  }
})();
`;

/**
 * How the node builtins are imported.
 *
 * Node builtins are external when `preferBuiltins` is set, and otherwise when no package of that name can be found. In
 * an ES module they are left as imports for whoever loads the bundle. They are never a dependency of a UMD or SystemJS
 * bundle, though: a library that reaches for one in a code path of its own for node (`require('crypto')`, `import('fs')`)
 * would make an AMD or SystemJS host load a module that it cannot. The builtin is read where it is used instead, with
 * `require` when there is one.
 *
 * @param {object} options
 * @param {'umd' | 'esm' | 'systemjs'} options.format
 * @param {boolean} [options.preferBuiltins]
 * @returns {import('rolldown').Plugin}
 */
export default function builtins({ format, preferBuiltins = false }) {
  const readBuiltins = format !== 'esm';
  return {
    name: 'nebula-builtins',
    async resolveId(source, importer, options) {
      if (source.startsWith(BUILTIN_PREFIX)) {
        return source;
      }
      if (!isBuiltin(source)) {
        return null;
      }
      if (!preferBuiltins) {
        const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
        if (resolved && !resolved.external && !isBuiltin(resolved.id)) {
          return resolved;
        }
      }
      return readBuiltins ? `${BUILTIN_PREFIX}${source}` : { id: source, external: true };
    },
    load: {
      filter: { id: { include: [new RegExp(`^${BUILTIN_PREFIX}`)] } },
      handler(id) {
        return { code: builtinModule(id.slice(BUILTIN_PREFIX.length)), moduleType: 'js' };
      },
    },
  };
}
