import path from 'node:path';
import crypto from 'node:crypto';

/**
 * @typedef {object} OutputPlan
 * @property {'umd' | 'es' | 'system'} format `system` is produced by bundling to `es` first and converting the chunks.
 * @property {string} [file] Single file output.
 * @property {string} [dir] Directory output, used with `entryFileName` and code splitting.
 * @property {string} [entryFileName]
 * @property {'named' | 'default'} exports
 * @property {string} [name] Global name of an UMD bundle.
 * @property {Record<string, string>} [globals]
 */

/**
 * @typedef {object} BundlePlan
 * @property {string} label
 * @property {boolean} debug Dev build: `__NEBULA_DEV__` is true and `.dev.js` is preferred over `.js`.
 * @property {boolean} minify
 * @property {boolean} sourcemap
 * @property {boolean} define Replace `__NEBULA_DEV__` and `process.env.*`, which not every package does.
 * @property {string} input
 * @property {string[]} external
 * @property {boolean} inlineDynamicImports A single file per output when true, otherwise code split.
 * @property {OutputPlan[]} outputs
 */

const NAMED_EXPORTS = ['test-utils', 'stardust'];

// Global names of the externals in UMD bundles
const GLOBALS = {
  react: 'React',
  'react-dom': 'ReactDOM',
  '@nebula.js/stardust': 'stardust',
};

const TYPES_SCOPE_RX = /^@qlik\/api/;

export const getTargetName = (pkg) => pkg.name.split('/')[1];

/** `process.env.NEBULA_VERSION_HASH`: the first four characters of the md5 of the version. */
export const getVersionHash = (version) => crypto.createHash('md5').update(version).digest('hex').slice(0, 4);

/** The name of the global of an UMD bundle, `test-utils` becomes `testUtils`. */
export const getUmdName = (targetName) =>
  targetName
    .replace(/-([a-z])/g, (m, p1) => p1.toUpperCase())
    .split('.js')
    .join('');

export const getBanner = ({ name, version, license }, year) => `/*
* ${name} v${version}
* Copyright (c) ${year} QlikTech International AB
* Released under the ${license} license.
*/
`;

/**
 * File name of an output, e.g. `stardust.esm.dev.js`.
 * @param {string} targetName
 * @param {string} [format]
 * @param {boolean} [dev]
 */
export const getFileName = (targetName, format, dev) =>
  `${targetName}${format ? `.${format}` : ''}${dev ? '.dev' : ''}.js`;

/**
 * Throws when a package target is not what the rest of the repo expects.
 * @param {object} pkg package.json of a web package
 */
export function validatePackage(pkg) {
  const targetName = getTargetName(pkg);
  const target = (format) => `dist/${getFileName(targetName, format)}`;

  if (pkg.main !== 'index.js') {
    throw Error(`main target must be index.js`);
  }

  // we include '.dev.js' as file extension when building a dev distribution, the module target should therefore end
  // with '.esm' and not with '.esm.js' so that the node resolve algorithm finds the correct module based on module
  // format and dev mode, e.g. '@nebula.js/stardust' -> '@nebula.js/stardust/dist/stardust.esm.dev.js'
  const moduleTargetName = target('esm').replace(/\.js$/, '');
  if (pkg.module && pkg.module !== moduleTargetName) {
    throw Error(`module target must be ${moduleTargetName}`);
  }
  if (pkg.unpkg && pkg.unpkg !== target('')) {
    throw Error(`unpkg target must be ${target('')}`);
  }
  if (pkg.jsdelivr && pkg.jsdelivr !== target('')) {
    throw Error(`jsdelivr target must be ${target('')}`);
  }
}

/**
 * Throws when a web package declares dependencies, other than the @qlik/api packages that are bundled.
 * @param {object} pkg package.json of a web package
 */
export function validateDependencies(pkg) {
  const unexpected = Object.keys(pkg.dependencies || {}).filter((dep) => !TYPES_SCOPE_RX.test(dep));
  if (unexpected.length) {
    throw new Error(
      `Dependencies for a web javascript library makes no sense: ${pkg.name} ${JSON.stringify(unexpected)}`
    );
  }
}

const globalsOf = (external) => Object.fromEntries(external.filter((e) => GLOBALS[e]).map((e) => [e, GLOBALS[e]]));

/**
 * Describes which bundles to build for a package and what to write for each of them.
 *
 * The production and dev variants are separate bundles. The UMD and ESM outputs of a variant share a bundle (one single
 * file, with dynamic imports inlined), while the SystemJS output needs a code split bundle of its own.
 *
 * @param {object} options
 * @param {string} options.cwd The package directory.
 * @param {object} options.pkg package.json of the package.
 * @param {object} [options.corePkg] core/package.json, when the package has one.
 * @param {boolean} [options.watch] Leave out the UMD outputs, as they are not used in development.
 * @returns {BundlePlan[]}
 */
export function createPlan({ cwd, pkg, corePkg, watch = false }) {
  validatePackage(pkg);
  validateDependencies(pkg);

  const targetName = getTargetName(pkg);
  const targetDir = path.join(cwd, 'dist');
  const exports = NAMED_EXPORTS.includes(targetName) ? 'named' : 'default';
  const input = path.resolve(cwd, 'src', 'index');
  const external = Object.keys(pkg.peerDependencies || {});

  const umd = (dev) => ({
    format: 'umd',
    file: path.join(targetDir, getFileName(targetName, '', dev)),
    exports,
    name: getUmdName(targetName),
    globals: globalsOf(external),
  });
  const es = (dev) => ({ format: 'es', file: path.join(targetDir, getFileName(targetName, 'esm', dev)), exports });
  const system = (dev) => ({
    format: 'system',
    dir: targetDir,
    entryFileName: getFileName(targetName, 'systemjs', dev),
    exports,
  });

  if (targetName === 'test-utils') {
    return [
      {
        label: 'umd',
        debug: false,
        minify: true,
        sourcemap: true,
        define: true,
        input,
        external,
        inlineDynamicImports: true,
        outputs: [umd(false)],
      },
    ];
  }

  const variants = [false, true].flatMap((dev) => {
    const label = dev ? 'dev' : 'prod';
    const inlined = [...(watch ? [] : [umd(dev)]), ...(pkg.module ? [es(dev)] : [])];
    return [
      ...(inlined.length
        ? [
            {
              label,
              debug: dev,
              minify: !dev,
              sourcemap: true,
              define: true,
              input,
              external,
              inlineDynamicImports: true,
              outputs: inlined,
            },
          ]
        : []),
      ...(targetName === 'stardust'
        ? [
            {
              label: `${label} systemjs`,
              debug: dev,
              minify: !dev,
              sourcemap: true,
              define: true,
              input,
              external,
              inlineDynamicImports: false,
              outputs: [system(dev)],
            },
          ]
        : []),
    ];
  });

  const core =
    corePkg && corePkg.module
      ? [false, true].map((dev) => ({
          label: `${dev ? 'dev' : 'prod'} core`,
          debug: dev,
          minify: !dev,
          sourcemap: true,
          define: true,
          input,
          external: Object.keys(corePkg.peerDependencies || {}),
          inlineDynamicImports: true,
          outputs: [{ format: 'es', file: path.resolve(cwd, 'core', dev ? 'esm/dev.js' : corePkg.module), exports }],
        }))
      : [];

  return [...variants, ...core];
}

/**
 * The bundle of the snapshooter client: one UMD file that is only minified for production builds.
 * @param {object} options
 * @param {string} options.cwd The package directory.
 * @param {boolean} options.production
 * @returns {BundlePlan[]}
 */
export function createSnapshooterPlan({ cwd, production }) {
  return [
    {
      label: 'client',
      debug: false,
      minify: production,
      sourcemap: false,
      define: false,
      input: path.resolve(cwd, 'src', 'renderer'),
      external: [],
      inlineDynamicImports: true,
      outputs: [{ format: 'umd', file: path.resolve(cwd, 'client.js'), exports: 'default', name: 'snapshooter' }],
    },
  ];
}
