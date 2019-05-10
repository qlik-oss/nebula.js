const path = require('path');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');
const { terser } = require('rollup-plugin-terser');

const cwd = process.cwd();
const pkg = require(path.join(cwd, 'package.json')); // eslint-disable-line
const {
  name,
  version,
  license,
} = pkg;

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

const config = (isEsm) => {
  const outputFile = isEsm ? pkg.module : pkg.main;
  const basename = path.basename(outputFile);
  const dir = path.dirname(outputFile);
  const umdName = basename.replace(/-([a-z])/g, (m, p1) => p1.toUpperCase()).split('.js').join('');

  if (Object.keys(pkg.dependencies || {}).length) {
    throw new Error('Dependencies for a web javascript library makes no sense');
  }

  const peers = Object.keys(pkg.peerDependencies || {});

  // all peers should be externals for esm bundle
  const esmExternals = peers;

  // peers that are not devDeps should be externals for full bundle
  const bundleExternals = peers.filter(p => typeof (pkg.devDependencies || {})[p] === 'undefined');

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
      file: path.resolve(dir, basename),
      format: isEsm ? 'esm' : 'umd',
      exports: 'default',
      name: umdName,
      sourcemap: true,
      banner,
      globals,
    },
    external,
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify(isEsm ? 'development' : 'production'),
        'process.env.NEBULA_VERSION': JSON.stringify(version),
      }),
      nodeResolve({
        extensions: ['.js', '.jsx'],
      }),
      commonjs({
        namedExports: {
          react: [
            'useState',
            'useEffect',
            'useRef',
            'useContext',
            'useCallback',
            'useMemo',
            'createElement',
            'PureComponent',
            'isValidElement',
            'Children',
            'cloneElement',
          ],
          'react-dom': ['createPortal', 'findDOMNode'],
          'react-is': ['ForwardRef'],
          'react-transition-group/node_modules/prop-types/index.js': propTypes,
          'prop-types/index.js': propTypes,
          '@material-ui/utils/node_modules/prop-types': propTypes,
        },
      }),
      babel({
        babelrc: false,
        include: [
          '/**/packages/nucleus/**',
          '/**/packages/ui/**',
        ],
        presets: [
          ['@babel/preset-env', {
            modules: false,
            targets: {
              browsers: [...browserList, ...(['ie 11', 'chrome 47'])],
            },
          }],
        ],
        plugins: [
          ['@babel/plugin-transform-react-jsx'],
        ],
      }),
    ],
  };

  if (process.env.NODE_ENV === 'production' && !isEsm) {
    cfg.plugins.push(terser({
      output: {
        preamble: banner,
      },
    }));
  }

  return cfg;
};

module.exports = [
  config(),
  config(true),
];
