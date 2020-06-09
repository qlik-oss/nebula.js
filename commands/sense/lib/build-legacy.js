const path = require('path');
const fs = require('fs-extra');

const rollup = require('rollup');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const common = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');
const babel = require('rollup-plugin-babel');
const { terser } = require('rollup-plugin-terser');

async function build(argv) {
  const cwd = process.cwd();

  const supernovaPkg = require(path.resolve(cwd, 'package.json')); // eslint-disable-line

  let extName = supernovaPkg.name.split('/').reverse()[0];

  const { main } = supernovaPkg;

  if (extName === main) {
    extName = extName.replace(/\.js$/, '-ext.js');
  }

  const targetDir = argv.output !== '<name>-ext' ? argv.output : `${extName}-ext`;
  const qextLegacyTargetDir = path.resolve(cwd, targetDir);
  const qextFileName = path.resolve(qextLegacyTargetDir, `${extName}.qext`);
  const qextFileNameJs = qextFileName.replace(/\.qext$/, '.js');

  const extDefinition = argv.ext ? path.resolve(argv.ext) : path.resolve(__dirname, '../src/legacy/empty-ext.js');

  const relativeMainFile = `./${main.replace(/\.js$/, '')}`;

  async function moveSnBundle() {
    const code = await fs.readFile(path.resolve(cwd, main), { encoding: 'utf8' });
    const replacedCode = code.replace(/@nebula.js\/stardust/g, '../nlib/@nebula.js/stardust/dist/stardust');

    await fs.outputFile(path.resolve(qextLegacyTargetDir, main), replacedCode);
  }

  async function moveResources() {
    await fs.copy(
      path.resolve(path.dirname(require.resolve('@nebula.js/stardust')), 'dist'),
      path.resolve(qextLegacyTargetDir, 'nlib/@nebula.js/stardust/dist')
    );
  }

  async function createQextFiles() {
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
    };

    await fs.writeFile(qextFileName, JSON.stringify(contents, null, 2));
  }

  async function wrapIt() {
    const bundle = await rollup.rollup({
      input: path.resolve(__dirname, '../src/legacy/sn-ext.js'),
      external: ['translator', 'qlik', './nlib/@nebula.js/stardust/dist/stardust', relativeMainFile],
      plugins: [
        replace({
          __SN_DEF__: `${relativeMainFile}`,
          __EXT_DEF__: `${extDefinition}`,
        }),
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
      file: qextFileNameJs,
      format: 'amd',
      sourcemap: argv.ext && argv.sourcemap,
    });
  }

  await fs.remove(qextLegacyTargetDir);
  await moveSnBundle();
  await moveResources();
  await wrapIt();
  await createQextFiles();
}

module.exports = build;
