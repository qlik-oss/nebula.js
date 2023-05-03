const build = require('./build');

function sense(argv) {
  if (argv.legacy) {
    console.error('Legacy sense-build support removed in 4.0, it is not required for sense compatability.');
    process.exit(1);
  }
  return build(argv);
}
module.exports = sense;
