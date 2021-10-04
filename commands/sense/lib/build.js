const path = require('path');
const fs = require('fs-extra');

const rollup = require('rollup');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const common = require('@rollup/plugin-commonjs');
const babel = require('rollup-plugin-babel');
const { terser } = require('rollup-plugin-terser');

async function build(argv) {
  const cwd = process.cwd();

  const supernovaPkg = require(path.resolve(cwd, 'package.json')); // eslint-disable-line

  let extName = supernovaPkg.name.split('/').reverse()[0]; // replace(/\//, '-').replace('@', '');

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
    qextjs = qextjs.replace('{{EXT}}', `./${targetFile}`);

    fs.writeFileSync(qextFileName, JSON.stringify(contents, null, 2));
    fs.writeFileSync(qextFileNameJs, qextjs);

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
      file: path.resolve(qextLegacyTargetDir, `${targetFile}.js`),
      format: 'amd',
      sourcemap,
    });
  }

  copySource();
  createQextFiles();
}

module.exports = build;
