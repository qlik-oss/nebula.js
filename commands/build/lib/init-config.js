/* eslint global-require: 0, no-param-reassign: 0 */
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const defaultFilename = 'nebula.config.js';
const RX = new RegExp(`${defaultFilename.replace(/\./g, '\\.')}$`);

const options = {
  config: {
    type: 'string',
    description: 'Path to a JavaScript config file',
    default: defaultFilename,
    alias: 'c',
  },
  watch: {
    description: 'Rebuild the bundle when its source files change on disk',
    alias: 'w',
    choices: ['umd', 'systemjs', true],
  },
  sourcemap: {
    description: 'Generate source maps',
    type: 'boolean',
    alias: 'm',
    default: true,
  },
  mode: {
    description: 'Explicitly set mode ("development"|"production")',
    type: 'string',
    default: undefined,
  },
  systemjs: {
    description: 'Enable to transpile a systemjs format for release',
    type: 'boolean',
    default: true,
  },
  core: {
    description: 'Set a core build target to compile an ES Module for release',
    type: 'string',
    default: undefined,
  },
  typescript: {
    description: 'Enable typescript parsing',
    type: 'boolean',
    default: false,
  },
  preferBuiltins: {
    description:
      'Leave Node.js built-in modules (such as fs or path) out of the bundle, as external dependencies, instead of resolving a package of the same name.',
    type: 'boolean',
    default: true,
  },
  browser: {
    description:
      "Use the 'browser' field and export condition of the packages in the bundle, so that browser specific files and conditionals in exports are applied.",
    type: 'boolean',
    default: true,
  },
  codeSplit: {
    description:
      'Write the esm and systemjs builds to a directory with the entry and a chunk for every dynamic import, instead of one file. The umd build is always one file.',
    type: 'boolean',
    default: false,
  },
  inlineDynamic: {
    description: 'Inline dynamic imports into the bundle in all builds, also when codeSplit is set',
    type: 'boolean',
    default: false,
  },
};

// nebula build --watch                - watch umd bundle
// nebula build --watch umd            - watch umd bundle
// nebula build --watch systemjs       - watch systemjs bundle
// nebula build                        - watch disabled
const watchMiddleware = (argv) => {
  let value = false;

  if (argv.watch === true) {
    value = 'umd';
  } else if (typeof argv.watch === 'string') {
    value = argv.watch;
  }

  argv.watch = value;
  argv.w = value;

  return argv;
};

export default (yargs) => {
  yargs.parserConfiguration({
    'dot-notation': false, // To avoid parsing "replacementStrings" with dot-notation into objects
  });

  return yargs
    .options(options)
    .config('config', (configPath) => {
      if (configPath === null) {
        return {};
      }
      if (!fs.existsSync(configPath)) {
        if (RX.test(configPath)) {
          // do nothing if default filename doesn't exist
          return {};
        }
        throw new Error(`Config ${configPath} not found`);
      }
      return require(configPath).build || {};
    })
    .middleware(watchMiddleware);
};
