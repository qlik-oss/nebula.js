const path = require('path');
const fs = require('fs-extra');

const rollup = require('rollup');
const nodeResolve = require('@rollup/plugin-node-resolve');
const common = require('@rollup/plugin-commonjs');
const babel = require('rollup-plugin-babel');
const { terser } = require('rollup-plugin-terser');

async function build(argv) {
  const cwd = process.cwd();

  const supernovaPkg = require(path.resolve(cwd, 'package.json')); // eslint-disable-line

  const extName = supernovaPkg.name.replace(/\//, '-').replace('@', '');

  const { main } = supernovaPkg;

  const qextTargetDir = path.resolve(cwd, 'dist-ext');
  const qextFileName = path.resolve(cwd, `${extName}.qext`);
  const qextFileNameJs = qextFileName.replace(/\.qext$/, '.js');

  fs.removeSync(qextTargetDir);
  fs.removeSync(qextFileName);
  fs.removeSync(qextFileNameJs);

  const extDefinition = argv.ext ? path.resolve(argv.ext) : undefined;

  const createQextFiles = () => {
    const qext = supernovaPkg.qext || {};
    if (argv.meta) {
      const meta = require(path.resolve(cwd, argv.meta)); // eslint-disable-line
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

    let qextjs = fs.readFileSync(path.resolve(__dirname, extDefinition ? '../src/ext.js' : '../src/empty-ext.js'), {
      encoding: 'utf8',
    });
    qextjs = qextjs.replace('{{DIST}}', `./${main.replace(/^[./]*/, '').replace(/\.js$/, '')}`);

    fs.writeFileSync(qextFileName, JSON.stringify(contents, null, 2));
    fs.writeFileSync(qextFileNameJs, qextjs);

    if (supernovaPkg.files) {
      [extDefinition ? path.basename(qextTargetDir) : false, path.basename(qextFileNameJs), path.basename(qextFileName)]
        .filter(Boolean)
        .forEach((f) => {
          if (!supernovaPkg.files.includes(f)) {
            console.warn(`  \x1b[33mwarn:\x1b[0m \x1b[36m${f}\x1b[0m should be included in package.json 'files' array`);
          }
        });
    }
  };

  if (extDefinition) {
    const bundle = await rollup.rollup({
      input: extDefinition,
      plugins: [
        nodeResolve(),
        common(),
        babel({
          babelrc: false,
          exclude: [/node_modules/],
          presets: [
            [
              '@babel/preset-env',
              {
                modules: false,
                targets: {
                  browsers: ['ie 11', 'chrome 47'],
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
      file: path.resolve(qextTargetDir, 'ext.js'),
      format: 'amd',
      sourcemap: argv.ext && argv.sourcemap,
    });
  }

  createQextFiles();
}

module.exports = build;
