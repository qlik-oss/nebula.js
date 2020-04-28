const path = require('path');
const babel = require('rollup-plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const nodeResolve = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');
const { terser } = require('rollup-plugin-terser');

const crypto = require('crypto');
const localeStringValidator = require('./tools/locale-string-validator');

const cwd = process.cwd();
const pkg = require(path.join(cwd, 'package.json')); // eslint-disable-line
const { name, version, license } = pkg;

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

// in our webpack/rollup configs we include '.dev.js' as file extension when building
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
  'Safari >= 10.0',
  'iOS >= 11.2',
];

const GLOBALS = {
  react: 'React',
  'react-dom': 'ReactDOM',
  '@nebula.js/stardust': 'stardust',
};

const propTypes = [
  'array',
  'bool',
  'func',
  'number',
  'object',
  'string',
  'symbol',

  'any',
  'arrayOf',
  'element',
  'instanceOf',
  'node',
  'objectOf',
  'oneOf',
  'oneOfType',
  'shape',
  'exact',
  'elementType',
];

const watch = process.argv.indexOf('-w') > 2;

const config = (isEsm, dev = false) => {
  const umdName = targetName
    .replace(/-([a-z])/g, (m, p1) => p1.toUpperCase())
    .split('.js')
    .join('');

  if (Object.keys(pkg.dependencies || {}).length) {
    throw new Error('Dependencies for a web javascript library makes no sense');
  }

  const peers = Object.keys(pkg.peerDependencies || {});

  // all peers should be externals for esm bundle
  const esmExternals = peers;

  // peers that are not devDeps should be externals for full bundle
  const bundleExternals = peers.filter((p) => typeof (pkg.devDependencies || {})[p] === 'undefined');

  const external = isEsm ? esmExternals : bundleExternals;
  const globals = {};
  external.forEach((e) => {
    if ([GLOBALS[e]]) {
      globals[e] = GLOBALS[e];
    }
  });

  const cfg = {
    input: path.resolve(cwd, 'src', 'index'),
    output: {
      file: path.resolve(targetDir, getFileName(isEsm ? 'esm' : '', dev)),
      format: isEsm ? 'esm' : 'umd',
      exports: ['test-utils', 'stardust'].indexOf(targetName) !== -1 ? 'named' : 'default',
      name: umdName,
      sourcemap: false,
      banner,
      globals,
    },
    external,
    plugins: [
      replace({
        __NEBULA_DEV__: dev,
        'process.env.NODE_ENV': JSON.stringify(isEsm ? 'development' : 'production'),
        'process.env.NEBULA_VERSION': JSON.stringify(version),
        'process.env.NEBULA_VERSION_HASH': JSON.stringify(versionHash),
      }),
      nodeResolve({
        extensions: [dev ? '.dev.js' : false, '.js', '.jsx'].filter(Boolean),
      }),
      json(),
      commonjs({
        namedExports: {
          react: [
            'useState',
            'useEffect',
            'useLayoutEffect',
            'useRef',
            'useReducer',
            'useImperativeHandle',
            'forwardRef',
            'useContext',
            'useCallback',
            'useMemo',
            'memo',
            'createElement',
            'createContext',
            'PureComponent',
            'Component',
            'isValidElement',
            'Children',
            'Fragment',
            'cloneElement',
            'useDebugValue',
          ],
          'react-dom': ['createPortal', 'findDOMNode'],
          'react-is': ['ForwardRef', 'Memo', 'isFragment'],
          'react-transition-group/node_modules/prop-types/index.js': propTypes,
          'prop-types/index.js': propTypes,
          '@material-ui/utils/node_modules/prop-types': propTypes,
        },
      }),
      babel({
        babelrc: false,
        include: [
          '/**/apis/locale/**',
          '/**/apis/nucleus/**',
          '/**/apis/snapshooter/**',
          '/**/apis/stardust/**',
          '/**/apis/supernova/**',
          '/**/apis/theme/**',
          '/**/packages/ui/**',
        ],
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false,
              targets: {
                browsers: [...browserList, ...['ie 11', 'chrome 47']],
              },
            },
          ],
        ],
        plugins: [['@babel/plugin-transform-react-jsx'], [localeStringValidator, {}]],
      }),
    ],
  };

  if (!dev) {
    cfg.plugins.push(
      terser({
        output: {
          preamble: banner,
        },
      })
    );
  }

  return cfg;
};

let dist = [
  // production
  watch ? false : config(),
  // dev
  watch ? false : config(false, true),

  // esm
  pkg.module ? config(true) : false,
  // esm dev
  pkg.module ? config(true, true) : false,
];

if (targetName === 'test-utils') {
  dist = [config(false)];
}

module.exports = dist.filter(Boolean);
