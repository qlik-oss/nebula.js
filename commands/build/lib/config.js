/* eslint-disable import/extensions */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import terser from '@rollup/plugin-terser';
// the resolver of ESLint does not read the exports of a package
// eslint-disable-next-line import/no-unresolved
import { esmExternalRequirePlugin } from 'rolldown/plugins';
import { visualizer } from 'rollup-plugin-visualizer';

import cssPlugin from './css.js';
import getTargets from './targets.js';
import { systemJs, ignoreInSourceMaps } from './esm-to-systemjs.js';

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

const KNOWN_GLOBALS = { '@nebula.js/stardust': 'stardust', react: 'React', 'react-dom': 'ReactDOM' };

// the name Rollup guessed for an external that has no global: the last part of its path without the extension, in camel
// case ('picasso.js' is picasso, 'lodash-es' is lodashEs)
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
  // a .native file is preferred to the file of the same name when building for react native
  if (reactNative) {
    extensions.unshift(...extensions.map((ext) => `.native${ext}`));
  }

  const external = core ? getExternalCore({ pkg }) : getExternal({ pkg, config: argv });
  // stardust should always be external
  if (external.indexOf('@nebula.js/stardust') === -1) {
    // eslint-disable-next-line no-console
    console.warn('@nebula.js/stardust should be specified as a peer dependency');
    external.push('@nebula.js/stardust');
  }

  const development = mode === 'development';
  const production = mode === 'production';
  const isSystemJs = format === 'systemjs';

  const output = () => {
    const outputConfig = {
      // after the minifier, which would remove it. A SystemJS bundle gets its banner when it is converted.
      postBanner: isSystemJs ? '' : banner,
      // SystemJS is not a format of Rolldown, the ES bundle is converted to it when it has been generated
      format: { umd: 'umd', esm: 'es', systemjs: 'es' }[format],
      name: outputName,
      sourcemap,
      globals: getGlobal,
      sourcemapIgnoreList: ignoreInSourceMaps,
      // terser is the minifier, Rolldown would print its output again, and write strings as template literals
      minify: false,
      plugins: [production ? terser() : false, isSystemJs ? systemJs({ banner }) : false].filter(Boolean),
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
      // MUI starts its modules with "use client", there is nothing for us to do about it
      checks: { moduleLevelDirective: false },
      plugins: [
        esmExternalRequirePlugin({ external }),
        cssPlugin({ cwd: CWD }),
        development ? visualizer({ filename: 'bundle-analysis.html' }) : false,
      ].filter(Boolean),
    },
    output: output(),
  };
};

export default config;
