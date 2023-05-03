const options = {
  ext: {
    type: 'string',
    required: false,
    desc: 'Extension definition',
  },
  meta: {
    type: 'string',
    required: false,
    desc: 'Extension meta information',
  },
  output: {
    type: 'string',
    required: false,
    default: '<name>-ext',
    desc: 'Destination directory',
  },
  minify: {
    type: 'boolean',
    required: false,
    default: true,
    desc: 'Minify and uglify code',
  },
  sourcemap: {
    type: 'boolean',
    required: false,
    default: false,
    desc: 'Generate sourcemaps',
  },
};

module.exports = (yargs) => yargs.options(options);
