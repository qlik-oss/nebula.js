import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { rspack } from '@rslib/core';

import builtins from './builtins.js';
import matchPeers from './peers.js';

const require = createRequire(import.meta.url);
const dirname = path.dirname(fileURLToPath(import.meta.url));

const browsersList = require('@qlik/browserslist-config');

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

// the project's own sass and less, the way rollup-plugin-postcss picked them up
const resolveFromProject = (name, cwd) => {
  try {
    return require(require.resolve(name, { paths: [cwd] }));
  } catch (e) {
    return null;
  }
};

const config = ({
  mode = 'production',
  format = 'esm',
  cwd = process.cwd(),
  argv = { sourcemap: true, codeSplit: false, inlineDynamic: false },
  core,
  behaviours: {
    getExternal = getExternalDefault,
    getOutputFile = getOutputFileDefault,
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
  // the chunks land beside the entry, the url of a chunk is relative to the url of the entry
  const outputDir = path.dirname(path.resolve(dir, outputFile));
  // rslib wants the entry as a file, the extension of it is the first that exists
  const entry =
    ['.js', '.jsx', '.mjs', ...(typescript ? ['.ts', '.tsx'] : [])]
      .map((extension) => path.resolve(CWD, `src/index${extension}`))
      .find((file) => fs.existsSync(file)) || path.resolve(CWD, 'src/index.js');
  // the chunks of a code split systemjs bundle are loaded relative to the url that SystemJS loaded the entry from
  const systemChunks = format === 'systemjs' && !singleFile;

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

  const styleRules = [
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
  ];

  const name = path.basename(outputFile).replace(/\.js$/, '');

  const lib = {
    // rslib has no system format, the iife of it is the System.register of rspack below
    format: isEsm ? 'esm' : 'iife',
    bundle: true,
    syntax: browsersList,
    banner: { js: banner },
    source: {
      entry: {
        [name]: systemChunks ? [path.resolve(dirname, 'system-public-path.js'), entry] : entry,
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify(development ? 'development' : 'production'),
        ...resolveReplacementStrings(replacementStrings),
      },
      // the dependencies are transpiled for the browsers as the code of the visualization is
      include: [/node_modules/],
    },
    output: {
      target: 'web',
      distPath: { root: outputDir },
      filename: { js: path.basename(outputFile) },
      minify: !development,
      sourceMap: sourcemap ? { js: 'source-map' } : false,
      externals: matchPeers(external),
      // the notices of the licenses go to <bundle>.LICENSE.txt
      legalComments: 'linked',
      cleanDistPath: false,
    },
    tools: {
      swc: {
        jsc: { transform: { react: { runtime: 'automatic', development } } },
      },
      // the stylesheets are handled below, with what they were handled with
      bundlerChain: (chain) => {
        ['css', 'sass', 'less'].forEach((rule) => chain.module.rules.delete(rule));
      },
      rspack: (base) => ({
        ...base,
        context: CWD,
        output: {
          ...base.output,
          // prefixed with the entry so that the chunks of es and systemjs bundles can share a directory
          chunkFilename: `${name}.[name]-[contenthash].js`,
          // the url of a chunk of a code split systemjs bundle is relative to the module, see system-public-path.js
          ...(systemChunks ? { publicPath: '' } : {}),
          ...(isEsm ? {} : { library: { type: 'system' } }),
          // an iife has no chunks in rslib, a code split systemjs bundle loads its chunks with script tags
          ...(systemChunks ? { asyncChunks: true, chunkLoading: 'jsonp', chunkFormat: 'array-push' } : {}),
          // LimitChunkCountPlugin alone leaves the chunks of some dynamic imports, which then collide on the file name
          ...(singleFile ? { asyncChunks: false } : {}),
        },
        // the modules of the host are System.register dependencies, and `import()` of one stays a dynamic import
        externalsType: isEsm ? 'module-import' : 'system',
        resolve: {
          ...base.resolve,
          extensions: reactNative ? extensions.flatMap((e) => [`.native${e}`, e]) : extensions,
          alias: { ...base.resolve?.alias, ...builtins.alias },
          mainFields: browser ? ['browser', 'module', 'main'] : ['module', 'main'],
          fallback: builtins.fallback,
          ...(browser ? {} : { conditionNames: ['module', 'import', 'require', 'default'] }),
        },
        module: {
          ...base.module,
          rules: [
            ...(base.module?.rules || []),
            // packages that ship esm without file extensions in their imports
            { test: /\.m?js$/, resolve: { fullySpecified: false } },
            ...styleRules,
          ],
        },
        optimization: {
          ...base.optimization,
          // process.env.NODE_ENV is defined above, rslib defines it again for an iife and the two conflict in development
          nodeEnv: false,
          // rollup tree-shakes in development too, rspack's development mode would not
          usedExports: true,
          sideEffects: true,
          providedExports: true,
          innerGraph: true,
          concatenateModules: true,
        },
        plugins: [
          ...(base.plugins || []),
          // @qlik/api imports the runtime modules for node (qix, invoke-fetch) behind `if (isNode)`, a browser gets
          // them from the host. Rollup left those out because it dropped the function that imports them when nothing
          // calls it, rspack drops the function too but has already bundled what it imports: about 450kb with
          // enigma.js and lodash.
          ...(browser
            ? [
                new rspack.IgnorePlugin({
                  resourceRegExp: /^\.\/(?:qix|invoke-fetch)-[\w-]+\.js$/,
                  contextRegExp: /@qlik[\\/]api[\\/]chunks$/,
                }),
              ]
            : []),
          ...(singleFile ? [new rspack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })] : []),
        ],
      }),
    },
  };

  return {
    cwd: CWD,
    config: {
      mode: development ? 'development' : 'production',
      lib: [lib],
    },
  };
};

export default config;
