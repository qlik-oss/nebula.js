import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';
import { parseArgs } from 'util';
import { rspack } from '@rslib/core';

const require = createRequire(import.meta.url);

// the browsers that Qlik supports, as the other packages of Qlik do
const browserList = require('@qlik/browserslist-config');

// rslib has its own arguments, only the watch is of interest
const { values } = parseArgs({
  args: process.argv.slice(2),
  options: { watch: { type: 'boolean', short: 'w' } },
  allowPositionals: true,
  strict: false,
});

// a watch has no use for the production bundles
export const watch = Boolean(values.watch);

export const readPackage = (dir) => require(path.join(dir, 'package.json'));

const createBanner = ({ name, version, license }) => `/*
* ${name} v${version}
* Copyright (c) ${new Date().getFullYear()} QlikTech International AB
* Released under the ${license} license.
*/`;

// @qlik/api loads its runtime modules (auth, qix, invoke-fetch) with one import() each and we only use auth
const QLIK_API_CHUNKS = {
  resourceRegExp: /^\.\/(?:qix|invoke-fetch)-[\w-]+\.js$/,
  contextRegExp: /@qlik[\\/]api[\\/]chunks$/,
};

// the dependencies of a library are what the consumer already has, anything else is bundled
const TYPES_SCOPE_RX = /^@qlik\/api/;

const hasRuntimeDependencies = (targetPkg) =>
  Object.keys(targetPkg.dependencies || {}).some((dep) => !TYPES_SCOPE_RX.test(dep));

/**
 * One bundle of the package in `cwd`: a single file that has everything but its peer dependencies in it.
 *
 * - esm: an es module, with the peer dependencies as static imports
 * - systemjs: a System.register module, which is what the micro frontend host loads from the import map
 *
 * A dev bundle is not minified, picks `.dev.js` files before `.js` files and has `__NEBULA_DEV__` on.
 */
export const bundle = ({
  cwd,
  targetPkg = readPackage(cwd),
  format,
  dev = false,
  dir = 'dist',
  file,
  entry = 'index.js',
  sourceMap = true,
}) => {
  if (hasRuntimeDependencies(targetPkg)) {
    throw new Error(`Dependencies for a web javascript library makes no sense: ${targetPkg.name}`);
  }
  // the banner and the version are the ones of the package that is built, also for its sub package
  const pkg = readPackage(cwd);
  const { version } = pkg;
  const versionHash = crypto.createHash('md5').update(version).digest('hex').slice(0, 4);
  // all peers are externals, they are never bundled
  const peers = Object.keys(targetPkg.peerDependencies || {});

  return {
    // rslib has no system format, the iife of it is the System.register of rspack below
    format: format === 'systemjs' ? 'iife' : 'esm',
    bundle: true,
    syntax: browserList,
    banner: { js: createBanner(pkg) },
    source: {
      entry: { [file.replace(/\.js$/, '')]: path.resolve(cwd, 'src', entry) },
      define: {
        __NEBULA_DEV__: JSON.stringify(dev),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV === 'development' ? 'development' : 'production'),
        'process.env.NEBULA_VERSION': JSON.stringify(version),
        'process.env.NEBULA_VERSION_HASH': JSON.stringify(versionHash),
      },
    },
    output: {
      target: 'web',
      distPath: { root: dir },
      filename: { js: file },
      minify: !dev,
      sourceMap: sourceMap && { js: 'source-map' },
      externals: peers,
      // the notices of the licenses of the bundled code, as <bundle>.LICENSE.txt
      legalComments: 'linked',
      // several bundles are written into the same directory, never let one wipe another's output
      cleanDistPath: false,
    },
    tools: {
      rspack: (config) => ({
        ...config,
        resolve: {
          ...config.resolve,
          extensions: [dev ? '.dev.js' : false, '.js', '.jsx', '.json'].filter(Boolean),
        },
        output: format === 'systemjs' ? { ...config.output, library: { type: 'system' } } : config.output,
        plugins: [
          ...config.plugins,
          // every bundle is one file: nothing is loaded at runtime, and the base url of a chunk would be a
          // guess under a SystemJS host
          new rspack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
          new rspack.IgnorePlugin(QLIK_API_CHUNKS),
        ],
      }),
    },
  };
};
