const path = require('path');
const fs = require('fs');

const rollup = require('rollup');
const nodeResolve = require('@rollup/plugin-node-resolve');
const common = require('@rollup/plugin-commonjs');
const babel = require('rollup-plugin-babel');
const { terser } = require('rollup-plugin-terser');

async function build(argv) {
  const cwd = process.cwd();
  const supernovaPkg = require(path.resolve(cwd, 'package.json')); // eslint-disable-line

  const extName = supernovaPkg.name.replace(/\//, '-').replace('@', '');

  const outputDirectory = argv.output ? argv.output : undefined;
  // define targetDirectory: use outputDirectory if defined, otherwise create extension in CWD
  const targetDirectory = outputDirectory
    ? path.resolve(argv.output, `${extName}-ext`)
    : path.resolve(cwd, `${extName}-ext`);

  let extDefinition = path.resolve(__dirname, '../src/ext-definition');

  if (argv.ext) {
    extDefinition = path.resolve(argv.ext);
  }

  const meta = argv.meta ? require(path.resolve(argv.meta)) : {}; // eslint-disable-line

  const { module, main } = supernovaPkg;

  const bundle = await rollup.rollup({
    input: {
      supernova: module || main,
      extDefinition,
      [extName]: path.resolve(__dirname, '../src/supernova-wrapper'),
    },
    external: ['snDefinition', 'extDefinition'],
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
    dir: targetDirectory,
    format: 'amd',
    sourcemap: true,
    paths: {
      snDefinition: './supernova',
      extDefinition: './extDefinition',
    },
    chunkFileNames: '[name]-[hash]',
  });

  // NOTE: chunkFileNames above must not contain '.js' at the end
  // since that would cause requirejs in sense-client to interpret the request as text/html
  // so we trim off the file extension in the modules, but then attach it to the files
  const files = fs.readdirSync(targetDirectory);
  files.forEach(f => {
    if (/^chunk-/.test(f) && !/\.js$/.test(f)) {
      // attach file extension
      fs.renameSync(path.resolve(targetDirectory, f), path.resolve(targetDirectory, `${f}.js`));
    }
  });

  // write .qext for the extension
  fs.writeFileSync(
    path.resolve(targetDirectory, `${extName}.qext`),
    JSON.stringify(
      {
        name: extName,
        description: supernovaPkg.description,
        author: supernovaPkg.author,
        version: supernovaPkg.version,
        ...meta,
        type: 'visualization',
      },
      null,
      2
    )
  );
}

module.exports = build;
