/* eslint-disable import/extensions */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { visualizer } from 'rollup-plugin-visualizer';

import resolveNative from './resolveNative.js';
import cssPlugin from './css.js';
import builtins, { isExternal } from './externals.js';
import getTargets from './targets.js';
import { systemJs } from './esm-to-systemjs.js';
import minify from './minify.js';

const require = createRequire(import.meta.url);
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

// the oldest version of every browser of the browserslist, the code is transformed to what they support
const TARGETS = getTargets(browsersList);

// the globals of the externals in a UMD bundle
const KNOWN_GLOBALS = { '@nebula.js/stardust': 'stardust', react: 'React', 'react-dom': 'ReactDOM' };

// the name Rollup guessed for an external that has no global: the last part of its path in camel case, 'some-peer' becomes 'somePeer'
const guessGlobalName = (id) =>
  id
    .split('/')
    .pop()
    .replace(/\.[cm]?js$/, '')
    .replace(/[^a-zA-Z0-9_$]+(.)?/g, (m, c) => (c ? c.toUpperCase() : ''));

const getGlobal = (id) => KNOWN_GLOBALS[id] || guessGlobalName(id);

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

  const development = mode === 'development';
  const isSystemJs = format === 'systemjs';

  const output = () => {
    const outputConfig = {
      // a production bundle gets its banner when it is minified, a SystemJS bundle when it is converted
      postBanner: isSystemJs || !development ? '' : banner,
      // SystemJS is not a format of Rolldown, the ES bundle is converted to it when it has been generated
      format: { umd: 'umd', esm: 'es', systemjs: 'es' }[format],
      name: outputName,
      sourcemap,
      globals: getGlobal,
      plugins: [
        // the ES chunks are minified before they are converted to SystemJS, which is why the conversion adds the banner
        development ? false : minify({ banner: isSystemJs ? undefined : banner }),
        isSystemJs ? systemJs({ banner }) : false,
      ].filter(Boolean),
    };
    if (format === 'umd') {
      // our sources are ES modules, which are strict. Rollup put the directive inside the wrapper of the bundle.
      outputConfig.intro = '"use strict";';
    }
    if (!argv.codeSplit || format === 'umd') {
      outputConfig.file = path.resolve(dir, outputFile);
    } else {
      outputConfig.dir = path.resolve(dir, outputFile.split('/')[0]);
    }
    if (format === 'umd' || argv.inlineDynamic) {
      outputConfig.codeSplitting = false;
    }
    return outputConfig;
  };

  return {
    input: {
      input: path.resolve(CWD, 'src/index'),
      external: (id) => isExternal(external, id),
      // Rollup left out a write to a property of an object that nothing uses, as the prototypes of the classes of a library
      // that the visualization imports one function of. Without this the whole of the prebuilt library is bundled.
      treeshake: { propertyWriteSideEffects: false },
      platform: browser ? 'browser' : 'neutral',
      resolve: {
        extensions,
        mainFields: browser ? ['browser', 'module', 'main'] : ['module', 'main'],
        // `import` or `require` is added by Rolldown, depending on how the module is imported
        conditionNames: browser ? ['module', 'browser'] : ['module'],
      },
      transform: {
        target: TARGETS,
        define: {
          'process.env.NODE_ENV': JSON.stringify(development ? 'development' : 'production'),
          ...Object.fromEntries(
            Object.entries(resolveReplacementStrings(replacementStrings)).map(([key, value]) => [key, String(value)])
          ),
        },
        jsx: { runtime: 'automatic', development },
        typescript: { onlyRemoveTypeImports: true },
      },
      plugins: [
        resolveNative({ reactNative }),
        builtins({ format, preferBuiltins }),
        cssPlugin({ cwd: CWD }),
        development ? visualizer({ filename: 'bundle-analysis.html' }) : false,
      ].filter(Boolean),
      onLog(level, log, handler) {
        // Supress "use client" warnings coming from MUI bundling
        if (log.code === 'MODULE_LEVEL_DIRECTIVE' && log.message.includes(`"use client"`)) {
          return;
        }
        handler(level, log);
      },
    },
    output: output(),
  };
};

export default config;
