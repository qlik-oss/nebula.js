/* eslint-disable no-console, import/extensions */
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire, builtinModules } from 'module';
import fs from 'fs-extra';

// eslint-disable-next-line import/no-unresolved -- @rspack/core is resolvable at runtime; the lint resolver doesn't know about it
import { rspack } from '@rspack/core';

import LegalCommentsPlugin from './legal-comments.js';

const require = createRequire(import.meta.url);
const moduleDir = path.dirname(fileURLToPath(import.meta.url));

const BUILTINS = new Set([...builtinModules, ...builtinModules.map((m) => `node:${m}`)]);
const PACKAGE_REQUEST = /^(?:@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*(?:\/[^!?]*)?$/i;

// like rollup did for the amd format, a bare import that cannot be resolved (typically a module provided by
// Qlik Sense such as 'qlik' or 'jquery') and node builtins stay out of the bundle and become amd dependencies
const externalsFor = (warn) => [
  async ({ request, getResolve, context }) => {
    if (!request) {
      return undefined;
    }
    if (BUILTINS.has(request)) {
      return request;
    }
    if (!PACKAGE_REQUEST.test(request)) {
      return undefined;
    }
    try {
      await new Promise((resolve, reject) => {
        getResolve()(context, request, (err, result) =>
          err || !result ? reject(err || new Error()) : resolve(result)
        );
      });
      return undefined;
    } catch (e) {
      warn(`'${request}' could not be resolved and is treated as an amd dependency`);
      return request;
    }
  },
];

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

  let extName = supernovaPkg.name.split('/').reverse()[0];

  const { main } = supernovaPkg;

  if (extName === main) {
    extName = extName.replace(/\.js$/, '-ext.js');
  }
  const { sourcemap } = argv;
  const targetDir = argv.output !== '<name>-ext' ? argv.output : `${extName}-ext`;
  const targetFile = 'ext';
  const qextLegacyTargetDir = path.resolve(cwd, targetDir);
  const qextFileName = path.resolve(qextLegacyTargetDir, `${extName}.qext`);
  const qextFileNameJs = qextFileName.replace(/\.qext$/, '.js');

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

    let qextjs = fs.readFileSync(path.resolve(moduleDir, extDefinition ? '../src/ext.js' : '../src/empty-ext.js'), {
      encoding: 'utf8',
    });
    qextjs = qextjs.replace('{{DIST}}', `./${main.replace(/^[./]*/, '').replace(/\.js$/, '')}`);
    qextjs = qextjs.replace('{{EXT}}', `./${targetFile}`);

    fs.writeFileSync(qextFileName, JSON.stringify(contents, null, 2));
    fs.writeFileSync(qextFileNameJs, qextjs);

    if (qext.preview) {
      const previewLocation = path.resolve(cwd, qext.preview);
      if (fs.existsSync(previewLocation)) {
        fs.copySync(previewLocation, path.resolve(qextLegacyTargetDir, qext.preview));
      } else {
        console.warn(`  \x1b[33mwarn:\x1b[0m \x1b[36m${qext.preview}\x1b[0m was not found`);
      }
    }

    if (supernovaPkg.files) {
      [
        extDefinition ? path.basename(qextLegacyTargetDir) : false,
        path.basename(qextFileNameJs),
        path.basename(qextFileName),
      ]
        .filter(Boolean)
        .forEach((f) => {
          if (!supernovaPkg.files.includes(f)) {
            console.warn(`  \x1b[33mwarn:\x1b[0m \x1b[36m${f}\x1b[0m should be included in package.json 'files' array`);
          }
        });
    }
  };

  const copySource = () => {
    fs.copySync(path.resolve(main), path.resolve(targetDir, main));

    if (sourcemap) {
      fs.copySync(path.resolve(`${main}.map`), path.resolve(targetDir, `${main}.map`));
    }
  };

  if (extDefinition) {
    await run({
      name: 'sense-ext',
      mode: 'production',
      context: cwd,
      target: ['web', 'es2017'],
      entry: path.resolve(moduleDir, 'amd-entry.cjs'),
      devtool: sourcemap ? 'source-map' : false,
      performance: false,
      stats: 'errors-warnings',
      output: {
        path: qextLegacyTargetDir,
        filename: `${targetFile}.js`,
        clean: false,
        library: { type: 'amd' },
        // sources are listed relative to the output, as rollup did
        devtoolModuleFilenameTemplate: (info) =>
          path.relative(qextLegacyTargetDir, info.absoluteResourcePath).replace(/\\/g, '/'),
      },
      externals: externalsFor((message) => console.warn(`  \x1b[33mwarn:\x1b[0m ${message}`)),
      externalsType: 'amd',
      resolve: {
        alias: { __nebula_sense_ext__: extDefinition },
        extensions: ['.js', '.json'],
        mainFields: ['module', 'main'],
      },
      module: {
        rules: [
          { test: /\.m?js$/, resolve: { fullySpecified: false } },
          {
            test: /\.m?js$/,
            exclude: [/node_modules/],
            use: {
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                sourceType: 'unambiguous',
                sourceMaps: !!sourcemap,
                presets: [
                  [
                    require.resolve('@babel/preset-env'),
                    {
                      modules: false,
                      targets: {
                        browsers: ['chrome 62'],
                      },
                    },
                  ],
                ],
              },
            },
          },
        ],
      },
      optimization: {
        minimize: !!argv.minify,
        minimizer: [
          new rspack.SwcJsMinimizerRspackPlugin({
            // the legal comments are put back by LegalCommentsPlugin, not left to the minifier
            minimizerOptions: { format: { comments: false } },
          }),
        ],
      },
      plugins: [
        new rspack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
        ...(argv.minify ? [new LegalCommentsPlugin()] : []),
      ],
    });
  }

  copySource();
  createQextFiles();
}

export default build;
