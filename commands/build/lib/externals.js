import { builtinModules } from 'module';

const BUILTINS = new Set([...builtinModules, ...builtinModules.map((m) => `node:${m}`)]);

// a request for a package ('react', '@scope/pkg/sub/path'), as opposed to a relative or absolute path or an
// inline loader request like '!!style-loader!./a.css' that the loaders add themselves
const PACKAGE_REQUEST = /^(?:@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*(?:\/[^!?]*)?$/i;
const isBare = (request) => PACKAGE_REQUEST.test(request);

// like rollup, a string only matches the exact id and a regular expression is tested against it
const matches = (external, request) => external.some((e) => (e instanceof RegExp ? e.test(request) : e === request));

// the name rollup guessed for an external that had no entry in output.globals: 'react-dom' -> 'reactDom'
const guessGlobalName = (request) =>
  request
    .split('/')
    .pop()
    .replace(/\.[cm]?js$/, '')
    .replace(/[^a-zA-Z0-9_$]+(.)?/g, (m, c) => (c ? c.toUpperCase() : ''));

/**
 * The `externals` option for a build.
 *
 * Mirrors what the rollup config did: ids listed as external stay out of the bundle, node builtins are
 * left alone when `preferBuiltins` is set, and a bare import that cannot be resolved is treated as an
 * external (with a warning) instead of failing the build.
 *
 * @param {object} options
 * @param {Array<string|RegExp>} options.external ids that must not be bundled
 * @param {string} options.format 'umd' | 'esm' | 'systemjs'
 * @param {object=} options.globals global variable names of the externals, used by the umd format
 * @param {boolean=} options.preferBuiltins
 * @param {Function=} options.warn
 */
export default function createExternals({ external, format, globals = {}, preferBuiltins = false, warn = () => {} }) {
  const toExternal = (request) =>
    format === 'umd'
      ? { root: globals[request] || guessGlobalName(request), commonjs: request, commonjs2: request, amd: request }
      : request;

  const unresolved = new Set();

  const fn = async ({ request, getResolve, context, dependencyType }) => {
    if (!request) {
      return undefined;
    }
    if (matches(external, request)) {
      return toExternal(request);
    }
    if (preferBuiltins && BUILTINS.has(request)) {
      if (dependencyType === 'commonjs') {
        // A require() call, as opposed to an import. Rollup left those alone, which is what makes a library that
        // calls require('crypto') in a function nothing uses (random-js does) harmless. Declaring it as a
        // dependency of the bundle instead makes a systemjs or amd host try to load 'crypto' and fail.
        // Keep it a call that is only made when the code is reached; an esm bundle cannot have a free require,
        // for that one the module resolves to an empty one, see the resolve.fallback of the build.
        return format === 'esm' ? undefined : `node-commonjs ${request}`;
      }
      return toExternal(request);
    }
    if (!isBare(request)) {
      return undefined;
    }
    try {
      await new Promise((resolve, reject) => {
        getResolve()(context, request, (err, result) =>
          err || !result ? reject(err || new Error()) : resolve(result)
        );
      });
      return undefined;
    } catch (e) {
      if (!unresolved.has(request)) {
        unresolved.add(request);
        warn(`'${request}' could not be resolved and is treated as an external dependency`);
      }
      return toExternal(request);
    }
  };

  return [fn];
}

export { guessGlobalName, BUILTINS };
