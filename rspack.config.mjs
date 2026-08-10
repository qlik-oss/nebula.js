/* eslint-disable no-console */
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';
import { rspack } from '@rspack/core';

const require = createRequire(import.meta.url);

const localeStringValidator = require('./tools/locale-string-validator.cjs');

const cwd = process.cwd();
const pkg = require(path.join(cwd, 'package.json'));
const { name, version, license } = pkg;

let corePkg;
try {
  corePkg = require(path.join(cwd, 'core', 'package.json'));
} catch (e) {
  // do nothing
}

const versionHash = crypto.createHash('md5').update(version).digest('hex').slice(0, 4);

const targetName = name.split('/')[1];
const targetDirName = 'dist';
const targetDir = path.join(cwd, targetDirName);

const getFileName = (format, dev) => `${targetName}${format ? `.${format}` : ''}${dev ? '.dev' : ''}.js`;
const getTargetFileName = (format, dev) => `${targetDirName}/${getFileName(format, dev)}`;

// verify package targets and names
if (pkg.main !== 'index.js') {
  throw Error(`main target must be index.js`);
}

// in our rspack configs we include '.dev.js' as file extension when building
// a dev distribution, the module target should therefore end with '.esm' and not with '.esm.js'
// so that the node resolve algorithm finds the correct module based on module format and dev mode
// e.g. '@nebula.js/stardust' -> '@nebula.js/stardust/dist/stardust.esm.dev.js'
const moduleTargetName = getTargetFileName('esm').replace(/\.js$/, '');
if (pkg.module && pkg.module !== moduleTargetName) {
  throw Error(`module target must be ${moduleTargetName}`);
}
if (pkg.unpkg && pkg.unpkg !== getTargetFileName('')) {
  throw Error(`unpkg target must be ${getTargetFileName('')}`);
}
if (pkg.jsdelivr && pkg.jsdelivr !== getTargetFileName('')) {
  throw Error(`jsdelivr target must be ${getTargetFileName('')}`);
}

const banner = `/*
* ${name} v${version}
* Copyright (c) ${new Date().getFullYear()} QlikTech International AB
* Released under the ${license} license.
*/
`;

const browserList = [
  'last 2 Chrome versions',
  'last 2 Firefox versions',
  'last 2 Edge versions',
  'Safari >= 11.0',
  'iOS >= 12.2',
];

const GLOBALS = {
  react: 'React',
  'react-dom': 'ReactDOM',
  '@nebula.js/stardust': 'stardust',
};

const watch = process.argv.includes('-w') || process.argv.includes('--watch');

const TYPES_SCOPE_RX = /^@qlik\/api/;

const LIBRARY_TYPES = {
  umd: 'umd',
  systemjs: 'system',
  // 'modern-module' emits the entry as two initial chunks (a re-exporting facade plus the
  // actual entry), which both claim output.filename and therefore collide. 'module' emits a
  // single flat esm file with the externals kept as static imports, which is what the
  // published core/esm output has always been.
  esm: 'module',
};

const config = ({ format = 'umd', debug = false, file, targetPkg }) => {
  const umdName = targetName
    .replace(/-([a-z])/g, (m, p1) => p1.toUpperCase())
    .split('.js')
    .join('');

  if (Object.keys(targetPkg.dependencies || {}).filter((dep) => !TYPES_SCOPE_RX.test(dep)).length) {
    console.log(targetPkg.name);
    console.log(JSON.stringify(Object.keys(targetPkg.dependencies || {}).filter((dep) => !TYPES_SCOPE_RX.test(dep))));
    throw new Error('Dependencies for a web javascript library makes no sense');
  }

  // all peers are externals, they should never be bundled
  const peers = Object.keys(targetPkg.peerDependencies || {});

  const globals = {};
  peers.forEach((e) => {
    if (GLOBALS[e]) {
      globals[e] = GLOBALS[e];
    } else {
      console.warn(`External '${e}' has no global value`);
    }
  });

  const isEsm = format === 'esm';

  // umd needs a global name for the browser (root) case, the module formats
  // reference the bare module specifier in all cases
  const externals = {};
  peers.forEach((e) => {
    externals[e] = format === 'umd' ? { root: globals[e] || e, commonjs: e, commonjs2: e, amd: e } : e;
  });

  const cfg = {
    mode: 'none',
    target: ['web', 'es2017'],
    entry: path.resolve(cwd, 'src', 'index'),
    devtool: 'source-map',
    output: {
      path: path.dirname(file),
      filename: path.basename(file),
      chunkFilename: 'chunks/[name]-[contenthash].js',
      uniqueName: `nebula-${targetName}${debug ? '-dev' : ''}-${format}`,
      publicPath: 'auto',
      globalObject: 'this',
      // several compilers write into the same directory, never let one wipe another's output
      clean: false,
      library: format === 'umd' ? { name: umdName, type: LIBRARY_TYPES[format] } : { type: LIBRARY_TYPES[format] },
    },
    externals,
    resolve: {
      extensions: [debug ? '.dev.js' : false, '.js', '.jsx'].filter(Boolean),
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: [
            /\/apis\/conversion\//,
            /\/apis\/enigma-mocker\//,
            /\/apis\/locale\//,
            /\/apis\/nucleus\//,
            /\/apis\/snapshooter\//,
            /\/apis\/stardust\//,
            /\/apis\/supernova\//,
            /\/apis\/theme\//,
            /\/packages\/ui\//,
          ],
          use: {
            loader: require.resolve('babel-loader'),
            options: {
              babelrc: false,
              configFile: false,
              // never enable cacheDirectory, it would suppress the locale string
              // validator warnings for unchanged files
              presets: [
                [
                  '@babel/preset-env',
                  {
                    modules: false,
                    targets: {
                      browsers: [...browserList, 'chrome 62'],
                    },
                  },
                ],
              ],
              plugins: [['@babel/plugin-transform-react-jsx'], [localeStringValidator, {}]],
            },
          },
        },
      ],
    },
    optimization: {
      minimize: !debug,
      minimizer: [
        new rspack.SwcJsMinimizerRspackPlugin({
          minimizerOptions: {
            format: {
              comments: false,
            },
          },
        }),
      ],
      concatenateModules: true,
      usedExports: true,
      sideEffects: true,
      providedExports: true,
      innerGraph: true,
    },
    plugins: [
      new rspack.DefinePlugin({
        __NEBULA_DEV__: JSON.stringify(debug),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV === 'development' ? 'development' : 'production'),
        'process.env.NEBULA_VERSION': JSON.stringify(version),
        'process.env.NEBULA_VERSION_HASH': JSON.stringify(versionHash),
      }),
      new rspack.BannerPlugin({
        banner,
        raw: true,
        entryOnly: true,
        // after minification, but before the source maps are finalized, so that
        // the banner is emitted verbatim and the mappings account for it
        stage: rspack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE + 1,
      }),
      // systemjs is the only code split target
      format !== 'systemjs' ? new rspack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }) : null,
    ].filter(Boolean),
  };

  if (isEsm) {
    cfg.externalsType = 'module';
    cfg.experiments = { outputModule: true };
  }

  return cfg;
};

let dist = [
  // production
  watch
    ? false
    : config({
        targetPkg: pkg,
        file: path.resolve(targetDir, getFileName()),
      }),
  // dev
  watch
    ? false
    : config({
        debug: true,
        targetPkg: pkg,
        file: path.resolve(targetDir, getFileName('', true)),
      }),
  // esm
  pkg.module
    ? config({
        format: 'esm',
        targetPkg: pkg,
        file: path.resolve(targetDir, getFileName('esm', false)),
      })
    : false,

  // esm dev
  pkg.module
    ? config({
        debug: true,
        format: 'esm',
        targetPkg: pkg,
        file: path.resolve(targetDir, getFileName('esm', true)),
      })
    : false,

  targetName === 'stardust'
    ? config({
        format: 'systemjs',
        targetPkg: pkg,
        file: path.resolve(targetDir, getFileName('systemjs', false)),
      })
    : false,

  targetName === 'stardust'
    ? config({
        debug: true,
        format: 'systemjs',
        targetPkg: pkg,
        file: path.resolve(targetDir, getFileName('systemjs', true)),
      })
    : false,

  // core esm
  corePkg && corePkg.module
    ? config({
        format: 'esm',
        targetPkg: corePkg,
        file: path.resolve(cwd, 'core', corePkg.module),
      })
    : false,
  // core esm dev
  corePkg && corePkg.module
    ? config({
        debug: true,
        format: 'esm',
        targetPkg: corePkg,
        file: path.resolve(cwd, 'core', 'esm', 'dev.js'),
      })
    : false,
];

if (targetName === 'test-utils') {
  dist = [
    config({
      targetPkg: pkg,
      file: path.resolve(targetDir, getFileName()),
    }),
  ];
}

export default dist.filter(Boolean);
