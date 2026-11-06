import path from 'path';
import os from 'os';
import { createRequire } from 'module';
import fs from 'fs-extra';

import { rspack } from '@rspack/core';

import builtins from '@nebula.js/cli-build/lib/builtins.js';
import matchPeers from '@nebula.js/cli-build/lib/peers.js';

const require = createRequire(import.meta.url);

// the browsers that Qlik supports, as in Qlik Sense
const BROWSERS = require('@qlik/browserslist-config');

const PACKAGE_REQUEST = /^(?:@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*(?:\/[^!?]*)?$/i;

// a bare import that cannot be resolved is a module that Qlik Sense provides, such as 'qlik' or 'jquery', it stays out
// of the bundle and becomes an amd dependency
const externalsFor = (warn) => [
  async ({ request, getResolve, context }) => {
    if (!request) {
      return undefined;
    }
    if (!PACKAGE_REQUEST.test(request)) {
      return undefined;
    }
    try {
      await new Promise((resolve, reject) => {
        getResolve()(context, request, (err, result) =>
          err || result === undefined ? reject(err || new Error()) : resolve(result)
        );
      });
      return undefined;
    } catch (e) {
      warn(`'${request}' could not be resolved and is treated as an amd dependency`);
      return request;
    }
  },
];

// a file as the request of an import in a module, a path is written with slashes on all platforms
const toModuleRequest = (file) => file.split(path.sep).join('/');

// the extension is the supernova, with the definition of the extension added to it
const wrapper = ({ supernova, ext }) =>
  ext
    ? `import supernova from ${JSON.stringify(toModuleRequest(supernova))};
import ext from ${JSON.stringify(toModuleRequest(ext))};

export default function supernovaExtension(env) {
  const v = supernova(env);
  v.ext = typeof ext === 'function' ? ext(env) : ext;
  return v;
}
`
    : `import supernova from ${JSON.stringify(toModuleRequest(supernova))};

export default supernova;
`;

const run = (configuration) =>
  new Promise((resolve, reject) => {
    const compiler = rspack(configuration);
    compiler.run((err, stats) => {
      compiler.close(() => {
        if (err) {
          reject(err);
        } else if (stats.hasErrors()) {
          reject(new Error(stats.toString({ all: false, errors: true, errorDetails: true, colors: false })));
        } else {
          resolve(stats);
        }
      });
    });
  });

async function build(argv) {
  const cwd = process.cwd();

  const supernovaPkg = require(path.resolve(cwd, 'package.json'));

  const extName = supernovaPkg.name.split('/').reverse()[0];
  const { module: moduleFile } = supernovaPkg;
  if (!moduleFile) {
    throw new Error(
      'package.json has no "module" field, the es module that nebula build writes is what nebula sense builds'
    );
  }
  const bundle = path.resolve(cwd, moduleFile);
  if (!fs.existsSync(bundle)) {
    throw new Error(`${moduleFile} does not exist, run nebula build first`);
  }
  // the modules that the host provides, they are not bundled and are amd dependencies of the extension
  const peers = ['@nebula.js/stardust', ...Object.keys(supernovaPkg.peerDependencies || {})];
  const { sourcemap } = argv;
  const targetDir = argv.output !== '<name>-ext' ? argv.output : `${extName}-ext`;
  const qextLegacyTargetDir = path.resolve(cwd, targetDir);
  const qextFileName = path.resolve(qextLegacyTargetDir, `${extName}.qext`);

  const extDefinition = argv.ext ? path.resolve(argv.ext) : undefined;

  const createQextFiles = () => {
    const qext = supernovaPkg.qext || {};
    if (argv.meta) {
      const meta = require(path.resolve(cwd, argv.meta));
      Object.assign(qext, meta);
    }
    const contents = {
      name: qext.name || extName,
      version: supernovaPkg.version,
      description: supernovaPkg.description,
      author: supernovaPkg.author,
      icon: qext.icon || 'extension',
      preview: qext.preview,
      type: 'visualization',
      supernova: true,
    };

    fs.mkdirSync(qextLegacyTargetDir, { recursive: true });
    fs.writeFileSync(qextFileName, JSON.stringify(contents, null, 2));

    if (qext.preview) {
      const previewLocation = path.resolve(cwd, qext.preview);
      if (fs.existsSync(previewLocation)) {
        fs.copySync(previewLocation, path.resolve(qextLegacyTargetDir, qext.preview));
      } else {
        console.warn(`  \x1b[33mwarn:\x1b[0m \x1b[36m${qext.preview}\x1b[0m was not found`);
      }
    }

    if (supernovaPkg.files) {
      [path.basename(qextLegacyTargetDir), path.basename(qextFileName)].forEach((f) => {
        if (!supernovaPkg.files.includes(f)) {
          console.warn(`  \x1b[33mwarn:\x1b[0m \x1b[36m${f}\x1b[0m should be included in package.json 'files' array`);
        }
      });
    }
  };

  // The extension is one amd module, the function that Qlik Sense calls with its environment: the supernova of the
  // es module that nebula build wrote, with the extension definition (--ext) added to it. The wrapper that does that is the entry of the build.
  const entryDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nebula-sense-'));
  const entry = path.join(entryDir, 'extension.js');
  fs.writeFileSync(entry, wrapper({ supernova: bundle, ext: extDefinition }));

  try {
    await run({
      name: 'sense-ext',
      mode: 'production',
      context: cwd,
      target: ['web', `browserslist:${BROWSERS.join(', ')}`],
      entry,
      devtool: sourcemap ? 'source-map' : false,
      performance: false,
      stats: 'errors-warnings',
      output: {
        path: qextLegacyTargetDir,
        filename: `${extName}.js`,
        clean: false,
        // what Qlik Sense calls is the default export of the wrapper
        library: { type: 'amd', export: 'default' },
      },
      externals: [
        ...matchPeers(peers),
        ...externalsFor((message) => console.warn(`  \x1b[33mwarn:\x1b[0m ${message}`)),
      ],
      externalsType: 'amd',
      resolve: {
        extensions: ['.js', '.jsx', '.json'],
        fallback: builtins.fallback,
        alias: builtins.alias,
        mainFields: ['module', 'main'],
      },
      module: {
        rules: [
          { test: /\.m?js$/, resolve: { fullySpecified: false } },
          {
            test: /\.m?jsx?$/,
            // the es module of nebula build is built for the browsers already
            exclude: [/node_modules/, bundle],
            use: {
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                sourceType: 'unambiguous',
                sourceMaps: !!sourcemap,
                presets: [[require.resolve('@babel/preset-env'), { modules: false, targets: { browsers: BROWSERS } }]],
              },
            },
          },
        ],
      },
      optimization: {
        minimize: !!argv.minify,
        minimizer: [
          new rspack.SwcJsMinimizerRspackPlugin({
            // the notices of the licenses go to <bundle>.LICENSE.txt, as webpack always did
            extractComments: true,
            minimizerOptions: { format: { comments: false } },
          }),
        ],
      },
      plugins: [new rspack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })],
    });
  } finally {
    fs.rmSync(entryDir, { recursive: true, force: true });
  }

  createQextFiles();
}

export default build;
