/* eslint-disable import/extensions */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
// eslint-disable-next-line import/no-unresolved -- @rspack/core is resolvable at runtime; the lint resolver doesn't know about it
import { rspack } from '@rspack/core';

import createExternals, { BUILTINS } from './externals.js';
import LegalCommentsPlugin from './legal-comments.js';

const require = createRequire(import.meta.url);
const dirname = path.dirname(fileURLToPath(import.meta.url));

const babelPreset = require('@babel/preset-env');
const browsersList = require('@qlik/browserslist-config');
const babelPresetReact = require('@babel/preset-react');
const babelPresetTypescript = require('@babel/preset-typescript');

const resolveReplacementStrings = (replacementStrings) => {
  if (typeof replacementStrings !== 'object') {
    throw new Error('replacementStrings should be an object with key value pairs of strings!');
  }
  return replacementStrings;
};

const setupReactNative = (argv) => {
  const { reactNative } = argv;
  let reactNativePath;
  if (reactNative) {
    reactNativePath = argv.reactNativePath || './react-native';
    if (!fs.existsSync(`${reactNativePath}/package.json`)) {
      // eslint-disable-next-line no-console
      console.warn(
        `WARNING: No ${reactNativePath}/package.json was found.  If you really intended to build a react-native version of this package, please provide one.\nOther wise, to suppress this warning, omit the --reactNative flag.`
      );
      return false;
    }
  }
  return { reactNative, reactNativePath };
};

const getBanner = ({ pkg }) => {
  const { name, author, version, license } = pkg;
  const auth = typeof author === 'object' ? `${author.name} <${author.email}>` : author || '';

  return `/*
* ${name} v${version}
* Copyright (c) ${new Date().getFullYear()} ${auth}
* Released under the ${license} license.
*/
`;
};

const getExternalDefault = ({ pkg }) => {
  const peers = pkg.peerDependencies || {};
  return Object.keys(peers);
};

const getExternalCore = ({ pkg }) => {
  const defaultExternal = ['@nebula.js/stardust', /^@qlik\/api\//];
  const peers = Object.keys(pkg.peerDependencies || {});
  return [...defaultExternal, ...peers];
};

const getOutputFileDefault = ({ pkg }) => pkg.main;

const getOutputNameDefault = ({ pkg }) => pkg.name.split('/').reverse()[0];

// the project's own sass and less, the way rollup-plugin-postcss picked them up
const resolveFromProject = (name, cwd) => {
  try {
    return require(require.resolve(name, { paths: [cwd] }));
  } catch (e) {
    return null;
  }
};

const LIBRARY_TYPES = { umd: 'umd', esm: 'module', systemjs: 'system' };

const config = ({
  mode = 'production',
  format = 'umd',
  cwd = process.cwd(),
  argv = { sourcemap: true, codeSplit: false, inlineDynamic: false },
  core,
  behaviours: {
    getExternal = getExternalDefault,
    getOutputFile = getOutputFileDefault,
    getOutputName = getOutputNameDefault,
    // Return false if no build should be done, otherwise true
    enabled = () => true,
  } = {},
} = {}) => {
  const CWD = argv.cwd || cwd;
  const { reactNative, reactNativePath } = setupReactNative(argv);
  let dir = CWD;
  let pkg = require(path.resolve(CWD, 'package.json'));
  const corePkg = core ? require(path.resolve(core, 'package.json')) : null;
  pkg = reactNative ? require(path.resolve(reactNativePath, 'package.json')) : pkg;
  const { sourcemap, replacementStrings = {}, typescript, preferBuiltins, browser } = argv;
  const banner = getBanner({ pkg });
  const outputName = getOutputName({ pkg, config: argv });

  if (reactNative) {
    dir = `${dir}/${reactNativePath}`;
  } else if (corePkg) {
    pkg = corePkg;
    dir = core;
  }

  if (!enabled({ pkg })) {
    return false;
  }
  const outputFile = getOutputFile({ pkg, config: argv });

  const extensions = ['.mjs', '.js', '.jsx', '.json'];
  if (typescript) {
    extensions.push('.tsx', '.ts');
  }

  const external = core ? getExternalCore({ pkg }) : getExternal({ pkg, config: argv });
  // stardust should always be external
  if (external.indexOf('@nebula.js/stardust') === -1) {
    // eslint-disable-next-line no-console
    console.warn('@nebula.js/stardust should be specified as a peer dependency');
    external.push('@nebula.js/stardust');
  }

  const isEsm = format === 'esm';
  const isUmd = format === 'umd';
  const development = mode === 'development';
  // umd always ends up in one file, the others do unless code splitting is asked for
  const singleFile = isUmd || argv.inlineDynamic || !argv.codeSplit;
  const outputDir = singleFile
    ? path.dirname(path.resolve(dir, outputFile))
    : path.resolve(dir, outputFile.split('/')[0]);
  const entry = path.resolve(CWD, 'src/index');
  // the umd bundles go through a small commonjs entry that normalises their exports, see umd-entry.cjs
  const entryFile = isUmd ? path.resolve(dirname, 'umd-entry.cjs') : entry;
  // the chunks of a code split systemjs bundle are loaded relative to the url that SystemJS loaded the entry from
  const systemChunks = format === 'systemjs' && !singleFile;

  const presets = [
    [
      babelPreset,
      {
        modules: false,
        targets: {
          browsers: browsersList,
        },
      },
    ],
  ];
  if (typescript) {
    presets.push([
      babelPresetTypescript,
      {
        allowNamespaces: true,
        onlyRemoveTypeImports: true,
      },
    ]);
  }

  const cssLoaders = (cssOptions = {}) => [
    require.resolve('./inject-style-loader.cjs'),
    { loader: require.resolve('css-loader'), options: { importLoaders: 1, ...cssOptions } },
    require.resolve('postcss-loader'),
  ];

  const sass = resolveFromProject('sass', CWD);
  const less = resolveFromProject('less', CWD);

  const cfg = {
    name: `${outputName || 'bundle'}-${format}`,
    mode: development ? 'development' : 'production',
    context: CWD,
    target: ['web', 'es2017'],
    entry: singleFile
      ? entryFile
      : { index: systemChunks ? [path.resolve(dirname, 'system-public-path.js'), entryFile] : entryFile },
    devtool: sourcemap ? 'source-map' : false,
    performance: false,
    stats: 'errors-warnings',
    output: {
      path: outputDir,
      // no module path comments in development builds, rollup did not write them
      pathinfo: false,
      filename: singleFile ? path.basename(outputFile) : '[name].js',
      chunkFilename: '[name]-[contenthash].js',
      publicPath: systemChunks ? '' : 'auto',
      // sources are listed relative to the output, as rollup did
      devtoolModuleFilenameTemplate: (info) => path.relative(outputDir, info.absoluteResourcePath).replace(/\\/g, '/'),
      // in parentheses, rspack pastes it into expressions such as `<globalObject>["chunk"] = <globalObject>["chunk"] || []`
      globalObject: '(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this)',

      clean: false,
      library: isUmd ? { name: outputName, type: LIBRARY_TYPES[format] } : { type: LIBRARY_TYPES[format] },
      // without an explicit chunkLoading an esm build has no way to load a split chunk and rspack folds
      // dynamic imports into the entry instead of splitting them (only matters for --codeSplit)
      ...(isEsm ? { module: true, chunkFormat: 'module', chunkLoading: 'import' } : {}),
    },
    externals: createExternals({
      external,
      format,
      globals: { '@nebula.js/stardust': 'stardust' },
      preferBuiltins,
      // eslint-disable-next-line no-console
      warn: (message) => console.warn(`  \x1b[33mwarn:\x1b[0m ${message}`),
    }),
    externalsType: isEsm ? 'module' : LIBRARY_TYPES[format],
    resolve: {
      extensions: reactNative ? extensions.flatMap((e) => [`.native${e}`, e]) : extensions,
      alias: isUmd ? { __nebula_build_entry__: entry } : {},
      mainFields: browser ? ['browser', 'module', 'main'] : ['module', 'main'],
      // a require() of a node builtin in an esm bundle, see externals.js
      ...(isEsm && preferBuiltins ? { fallback: Object.fromEntries([...BUILTINS].map((name) => [name, false])) } : {}),
      ...(browser ? {} : { conditionNames: ['module', 'import', 'require', 'default'] }),
    },
    module: {
      rules: [
        // packages that ship esm without file extensions in their imports
        { test: /\.m?js$/, resolve: { fullySpecified: false } },
        {
          test: /\.(?:[cm]?js|jsx|tsx?)$/,
          use: {
            loader: require.resolve('babel-loader'),
            options: {
              babelrc: false,
              configFile: false,
              cacheDirectory: false,
              sourceType: 'unambiguous',
              sourceMaps: !!sourcemap,
              presets,
              overrides: [
                {
                  test: /\.[jt]sx$/,
                  presets: [[babelPresetReact, { runtime: 'automatic', development }]],
                },
              ],
            },
          },
        },
        {
          test: /\.module\.css$/,
          use: cssLoaders({
            modules: {
              namedExport: false,
              exportLocalsConvention: 'as-is',
              localIdentName: '[name]_[local]__[hash:base64:5]',
            },
          }),
        },
        { test: /\.css$/, exclude: /\.module\.css$/, use: cssLoaders() },
        ...(sass
          ? [
              {
                test: /\.s[ac]ss$/,
                use: [
                  ...cssLoaders({ importLoaders: 2 }),
                  { loader: require.resolve('sass-loader'), options: { implementation: sass } },
                ],
              },
            ]
          : []),
        ...(less
          ? [
              {
                test: /\.less$/,
                use: [
                  ...cssLoaders({ importLoaders: 2 }),
                  { loader: require.resolve('less-loader'), options: { implementation: less } },
                ],
              },
            ]
          : []),
      ],
    },
    optimization: {
      // process.env.NODE_ENV is replaced below
      nodeEnv: false,
      // rollup tree-shakes in development too, rspack's development mode would not
      usedExports: true,
      sideEffects: true,
      providedExports: true,
      innerGraph: true,
      concatenateModules: true,
      minimize: !development,
      minimizer: [
        new rspack.SwcJsMinimizerRspackPlugin({
          minimizerOptions: {
            // the legal comments are put back by LegalCommentsPlugin, not left to the minifier
            format: { comments: false },
          },
        }),
      ],
    },
    plugins: [
      new rspack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(development ? 'development' : 'production'),
        ...resolveReplacementStrings(replacementStrings),
      }),
      ...(development ? [] : [new LegalCommentsPlugin({ banner })]),
      new rspack.BannerPlugin({
        banner,
        raw: true,
        entryOnly: true,
        // after minification so the banner is emitted verbatim
        stage: rspack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE + 1,
      }),
      ...(singleFile ? [new rspack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })] : []),
    ],
  };

  if (isEsm) {
    cfg.experiments = { outputModule: true };
  }

  return cfg;
};

export default config;
