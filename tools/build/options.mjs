import { createRequire } from 'node:module';
import terser from '@rollup/plugin-terser';
// the resolver of ESLint does not read the exports of a package
// eslint-disable-next-line import/no-unresolved
import { esmExternalRequirePlugin } from 'rolldown/plugins';
import { getVersionHash } from './plan.mjs';
import esmToSystemJs from './esm-to-systemjs.mjs';

const require = createRequire(import.meta.url);

/**
 * The oldest browser we support of each kind in the list we used for Babel, which was:
 * last 2 Chrome versions, last 2 Firefox versions, last 2 Edge versions, Safari >= 11.0, iOS >= 12.2, and chrome 62.
 * The last versions of Chrome, Firefox and Edge are all newer than what the others require, so these decide.
 */
export const TARGETS = ['chrome62', 'safari11', 'ios12.2'];

// Source files in these locations are checked for locale strings
const LOCALE_CHECKED =
  /[\\/](apis[\\/](conversion|enigma-mocker|locale|nucleus|snapshooter|stardust|supernova|theme)|packages[\\/]ui)[\\/](?!.*node_modules)/;

/**
 * Checks that the strings that components ask a translator for exist in the locale registry. The check is a Babel
 * plugin that only reports, so Babel is only used on the files that ask a translator for a string.
 * @returns {import('rolldown').Plugin}
 */
export function localeStringValidator() {
  const babel = require('@babel/core');
  const validator = require('../locale-string-validator.cjs');

  return {
    name: 'locale-string-validator',
    transform: {
      filter: { id: { include: [LOCALE_CHECKED], exclude: [/node_modules/] }, code: { include: [/translator/] } },
      handler(code, id) {
        babel.transformSync(code, {
          filename: id,
          babelrc: false,
          configFile: false,
          sourceType: 'module',
          parserOpts: { plugins: ['jsx'] },
          plugins: [[validator, {}]],
          code: false,
          ast: false,
        });
        return null;
      },
    },
  };
}

/**
 * Rolldown's minifier removes code that Terser cannot (it keeps `Ns.x = function () {}` on a local object, and what it
 * refers to), but it prints strings as template literals. That is why the minifier is run without printing whitespace,
 * which leaves the strings as they are, and Terser prints the result. Rolldown minifies after the `renderChunk` hooks
 * of the plugins, so Terser has to run in `generateBundle`, when the minified chunks are final.
 */
export const MINIFY = { compress: true, mangle: false, codegen: { removeWhitespace: false } };

/**
 * Sets the code and the map of a chunk, also in the asset that the source map is written from.
 */
function setChunk(bundle, chunk, { code, map }) {
  Object.assign(chunk, { code, map });
  const asset = chunk.sourcemapFileName && bundle[chunk.sourcemapFileName];
  if (map && asset) {
    asset.source = JSON.stringify(map);
  }
}

/**
 * The map that Terser returns has the sources it was given, but it has not got the `file` and the `ignoreList` of the
 * map it chained. The sources that are ignored are found again by their path, as the indices have moved.
 */
function withMapFields(map, original) {
  const ignored = new Set((original.ignoreList || []).map((i) => original.sources[i]));
  return {
    ...map,
    ...(original.file ? { file: original.file } : {}),
    ignoreList: map.sources.flatMap((source, i) => (ignored.has(source) ? [i] : [])),
  };
}

/**
 * Minifies the chunks of an output with Terser, after Rolldown has compressed them, see `MINIFY`.
 * @param {object} options
 * @param {string} options.banner Is the preamble of Terser, which removes comments, it is not added by the output.
 * @returns {import('rolldown').Plugin}
 */
export function terserLast({ banner }) {
  return {
    name: 'terser-last',
    async generateBundle(outputOptions, bundle) {
      const chunks = Object.values(bundle).filter((file) => file.type === 'chunk');
      const sourceMap = Boolean(outputOptions.sourcemap);
      await Promise.all(
        chunks.map(async (chunk) => {
          // the map of the chunk is given to Terser, which chains it. One plugin per chunk, as its options are fixed.
          const content = sourceMap && chunk.map ? JSON.parse(JSON.stringify(chunk.map)) : undefined;
          const printer = terser({ output: { preamble: banner }, ...(content ? { sourceMap: { content } } : {}) });
          const result = await printer.renderChunk.call(this, chunk.code, chunk, outputOptions);
          if (result) {
            // Terser drops the comment that refers to the map
            const [url] = chunk.code.match(/^\/\/# sourceMappingURL=.*$/m) || [];
            const code = result.code ?? result;
            setChunk(bundle, chunk, {
              code: url ? `${code}\n${url}` : code,
              // without a map to chain, the map of Terser would map the compressed code only
              map: content && result.map ? withMapFields(result.map, content) : chunk.map,
            });
          }
        })
      );
    },
  };
}

/**
 * Converts the ES chunks of an output to SystemJS modules, after they have been generated.
 * @param {object} options
 * @param {string} options.banner
 * @param {typeof import('rollup').rollup} options.rollup
 * @returns {import('rolldown').Plugin}
 */
export function systemJs({ banner, rollup }) {
  return {
    name: 'esm-to-systemjs',
    async generateBundle(outputOptions, bundle) {
      const chunks = Object.values(bundle).filter((file) => file.type === 'chunk');
      const converted = await esmToSystemJs({
        rollup,
        banner,
        // surfaced like the warnings of Rolldown
        onwarn: (warning) => this.warn(warning.message),
        outDir: outputOptions.dir,
        sourcemap: Boolean(outputOptions.sourcemap),
        chunks: chunks.map(({ fileName, code, map }) => ({ fileName, code, map })),
      });
      // The source map is written from an asset of its own, which is not made from `chunk.map` again
      converted.forEach(({ fileName, code, map }) => setChunk(bundle, bundle[fileName], { code, map }));
    },
  };
}

/**
 * Rolldown options for a bundle in the plan.
 * @param {import('./plan.mjs').BundlePlan} bundle
 * @param {object} context
 * @param {object} context.pkg package.json of the package
 * @param {string} context.banner
 * @param {typeof import('rollup').rollup} context.rollup
 * @param {boolean} context.checkLocale
 * @param {string} [context.nodeEnv]
 * @returns {import('rolldown').RolldownOptions}
 */
export function createRolldownOptions(bundle, { pkg, banner, rollup, checkLocale, nodeEnv }) {
  const { debug, minify, sourcemap, define, input, external, inlineDynamicImports, outputs } = bundle;

  const defines = define
    ? {
        __NEBULA_DEV__: String(debug),
        'process.env.NODE_ENV': JSON.stringify(nodeEnv === 'development' ? 'development' : 'production'),
        'process.env.NEBULA_VERSION': JSON.stringify(pkg.version),
        'process.env.NEBULA_VERSION_HASH': JSON.stringify(getVersionHash(pkg.version)),
      }
    : {};

  return {
    input,
    platform: 'browser',
    resolve: {
      // in a dev build '.dev.js' is tried first, so that './foo' finds './foo.dev.js' over './foo.js'
      extensions: [debug ? '.dev.js' : false, '.js', '.jsx'].filter(Boolean),
    },
    transform: { target: TARGETS, define: defines },
    // MUI starts its modules with "use client", there is nothing for us to do about it
    checks: { moduleLevelDirective: false },
    plugins: [
      ...(checkLocale ? [localeStringValidator()] : []),
      // Owns the externals: they are what a bundle leaves out, and the plugin turns the `require` of them in CommonJS
      // modules (react-dom requires react) into imports in an ES output, where there is no global `require`.
      ...(external.length ? [esmExternalRequirePlugin({ external })] : []),
    ],
    output: outputs.map((out) => {
      const isSystem = out.format === 'system';
      return {
        format: isSystem ? 'es' : out.format,
        ...(out.file ? { file: out.file } : { dir: out.dir, entryFileNames: out.entryFileName }),
        ...(isSystem ? { chunkFileNames: 'chunks/[name]-[hash].js' } : {}),
        exports: out.exports,
        // like Rollup did, an UMD bundle is strict inside its factory: our sources are ES modules. The `strict` option
        // of Rolldown puts the directive before the wrapper.
        ...(out.format === 'umd' ? { intro: '"use strict";' } : {}),
        name: out.name,
        globals: out.globals,
        sourcemap,
        // Rolldown compresses, and Terser prints, see `terserLast`. Not `true`: that prints template literals.
        minify: minify ? MINIFY : false,
        // A SystemJS output gets its banner when it is converted, a minified one from Terser, which would remove it here.
        postBanner: isSystem || minify ? '' : banner,
        ...(inlineDynamicImports ? { codeSplitting: false } : {}),
        plugins: [
          ...(minify ? [terserLast({ banner: isSystem ? '' : banner })] : []),
          ...(isSystem ? [systemJs({ banner, rollup })] : []),
        ],
      };
    }),
  };
}
