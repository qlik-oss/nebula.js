import { createRequire } from 'node:module';
// the resolver of ESLint does not read the exports of a package
// eslint-disable-next-line import/no-unresolved
import { esmExternalRequirePlugin } from 'rolldown/plugins';
import { getVersionHash } from './plan.mjs';
import esmToSystemJs from './esm-to-systemjs.mjs';
import plainStrings from './plain-strings.mjs';

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
 * Writes the strings of minified code with quotes, which is what other tools expect, see plain-strings.mjs.
 * @returns {import('rolldown').Plugin}
 */
export function quotedStrings() {
  return {
    name: 'quoted-strings',
    generateBundle(outputOptions, bundle) {
      Object.values(bundle)
        .filter((file) => file.type === 'chunk')
        .forEach((chunk) => {
          // the same length, so the source map of the chunk is not touched
          Object.assign(chunk, { code: plainStrings(chunk.code) });
        });
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
      converted.forEach(({ fileName, code, map }) => {
        const chunk = bundle[fileName];
        Object.assign(chunk, { code, map });
        // The source map is written from an asset of its own, which is not made from `chunk.map` again
        const asset = chunk.sourcemapFileName && bundle[chunk.sourcemapFileName];
        if (map && asset) {
          asset.source = JSON.stringify(map);
        }
      });
    },
  };
}

/**
 * Logs we leave out, as there is nothing for us to do about them: MUI starts its modules with "use client".
 * The INVALID_ANNOTATION and CIRCULAR_DEPENDENCY warnings of Rollup, that we used to filter for MUI, semver and
 * @qlik/api, are not logged by Rolldown.
 * @param {{ code?: string, message?: string }} log
 */
export const isIgnoredLog = ({ code, message = '' }) =>
  code === 'MODULE_LEVEL_DIRECTIVE' && message.includes('"use client"');

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
    plugins: [
      ...(checkLocale ? [localeStringValidator()] : []),
      // Owns the externals: they are what a bundle leaves out, and the plugin turns the `require` of them in CommonJS
      // modules (react-dom requires react) into imports in an ES output, where there is no global `require`.
      ...(external.length ? [esmExternalRequirePlugin({ external })] : []),
    ],
    onLog(level, log, handler) {
      if (!isIgnoredLog(log)) {
        handler(level, log);
      }
    },
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
        // post, so that minification does not remove it. A SystemJS output gets its banner when it is converted
        postBanner: isSystem ? '' : banner,
        minify,
        ...(inlineDynamicImports ? { codeSplitting: false } : {}),
        plugins: [...(minify ? [quotedStrings()] : []), ...(isSystem ? [systemJs({ banner, rollup })] : [])],
      };
    }),
  };
}
