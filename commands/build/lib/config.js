import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { rspack } from '@rspack/core';

import builtins from './builtins.js';
import matchPeers from './peers.js';

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

const getOutputFileDefault = ({ pkg }) => pkg.module;

const getOutputNameDefault = ({ pkg }) => pkg.name.split('/').reverse()[0];

// the project's own sass and less, the way rollup-plugin-postcss picked them up
const resolveFromProject = (name, cwd) => {
  try {
    return require(require.resolve(name, { paths: [cwd] }));
  } catch (e) {
    return null;
  }
};

const LIBRARY_TYPES = { esm: 'module', systemjs: 'system' };

const config = ({
  mode = 'production',
  format = 'esm',
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
  const CWD = path.resolve(argv.cwd || cwd);
  const { reactNative, reactNativePath } = setupReactNative(argv);
  let dir = CWD;
  let pkg = require(path.resolve(CWD, 'package.json'));
  const corePkg = core ? require(path.resolve(core, 'package.json')) : null;
  pkg = reactNative ? require(path.resolve(reactNativePath, 'package.json')) : pkg;
  const { sourcemap, replacementStrings = {}, typescript, browser } = argv;
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
    console.warn('@nebula.js/stardust should be specified as a peer dependency');
    external.push('@nebula.js/stardust');
  }

  const isEsm = format === 'esm';
  const development = mode === 'development';
  // a bundle ends up in one file unless code splitting is asked for
  const singleFile = argv.inlineDynamic || !argv.codeSplit;
  const outputDir = singleFile
    ? path.dirname(path.resolve(dir, outputFile))
    : path.resolve(dir, outputFile.split('/')[0]);
  const entry = path.resolve(CWD, 'src/index');
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

  // the class names of a css module are the default export of the module, and are named like they were
  const cssModules = {
    namedExport: false,
    exportLocalsConvention: 'as-is',
    localIdentName: '[name]_[local]__[hash:base64:5]',
  };

  // `url()` is left as it is written, the stylesheet is not a place to bundle assets, as it was before
  const cssLoaders = (cssOptions = {}) => [
    require.resolve('./inject-style-loader.cjs'),
    {
      loader: require.resolve('css-loader'),
      // the style is a string in the bundle, a source map of it in the text would only make the bundle larger
      options: { importLoaders: 1, url: false, sourceMap: false, ...cssOptions },
    },
    require.resolve('postcss-loader'),
  ];

  const sass = resolveFromProject('sass', CWD);
  const less = resolveFromProject('less', CWD);

  const cfg = {
    name: `${outputName || 'bundle'}-${format}`,
    mode: development ? 'development' : 'production',
    context: CWD,
    target: ['web', `browserslist:${browsersList.join(', ')}`],
    entry: singleFile
      ? entry
      : { index: systemChunks ? [path.resolve(dirname, 'system-public-path.js'), entry] : entry },
    devtool: sourcemap ? 'source-map' : false,
    performance: false,
    stats: 'errors-warnings',
    output: {
      path: outputDir,
      filename: singleFile ? path.basename(outputFile) : '[name].js',
      chunkFilename: '[name]-[contenthash].js',
      // the url of a chunk of a code split systemjs bundle is relative to the module, see system-public-path.js
      ...(systemChunks ? { publicPath: '' } : {}),
      clean: false,
      library: { type: LIBRARY_TYPES[format] },
      // without an explicit chunkLoading an esm build has no way to load a split chunk and rspack folds
      // dynamic imports into the entry instead of splitting them (only matters for --codeSplit)
      ...(isEsm ? { module: true, chunkFormat: 'module', chunkLoading: 'import' } : {}),
    },
    externals: matchPeers(external),
    // module-import keeps `import()` of an external a dynamic import
    externalsType: isEsm ? 'module-import' : LIBRARY_TYPES[format],
    resolve: {
      extensions: reactNative ? extensions.flatMap((e) => [`.native${e}`, e]) : extensions,
      alias: builtins.alias,
      mainFields: browser ? ['browser', 'module', 'main'] : ['module', 'main'],
      fallback: builtins.fallback,
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
          use: cssLoaders({ modules: cssModules }),
        },
        { test: /\.css$/, exclude: /\.module\.css$/, use: cssLoaders() },
        ...(sass
          ? [
              {
                test: /\.s[ac]ss$/,
                use: [
                  ...cssLoaders({ importLoaders: 2, modules: { auto: true, ...cssModules } }),
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
                  ...cssLoaders({ importLoaders: 2, modules: { auto: true, ...cssModules } }),
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
          // the notices of the licenses go to <bundle>.LICENSE.txt, as webpack always did
          extractComments: true,
          minimizerOptions: { format: { comments: false } },
        }),
      ],
    },
    plugins: [
      new rspack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(development ? 'development' : 'production'),
        ...resolveReplacementStrings(replacementStrings),
      }),
      // @qlik/api imports the runtime modules for node (qix, invoke-fetch) behind `if (isNode)`, a browser gets them
      // from the host. Rollup left those out because it dropped the function that imports them when nothing calls it,
      // rspack drops the function too but has already bundled what it imports: about 450kb with enigma.js and lodash.
      ...(browser
        ? [
            new rspack.IgnorePlugin({
              resourceRegExp: /^\.\/(?:qix|invoke-fetch)-[\w-]+\.js$/,
              contextRegExp: /@qlik[\\/]api[\\/]chunks$/,
            }),
          ]
        : []),
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
