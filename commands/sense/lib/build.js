/* eslint-disable no-console, import/extensions */
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import fs from 'fs-extra';

import * as rollup from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import common from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

const require = createRequire(import.meta.url);
const moduleDir = path.dirname(fileURLToPath(import.meta.url));

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
    const bundle = await rollup.rollup({
      input: extDefinition,
      plugins: [
        nodeResolve(),
        common(),
        babel({
          babelHelpers: 'bundled',
          babelrc: false,
          exclude: [/node_modules/],
          presets: [
            [
              '@babel/preset-env',
              {
                modules: false,
                targets: {
                  browsers: ['chrome 62'],
                },
              },
            ],
          ],
        }),
        argv.minify &&
          terser({
            output: {
              comments: /@license|@preserve|Copyright|license/,
            },
          }),
      ],
    });

    await bundle.write({
      file: path.resolve(qextLegacyTargetDir, `${targetFile}.js`),
      format: 'amd',
      sourcemap,
    });
  }

  copySource();
  createQextFiles();
}

export default build;
