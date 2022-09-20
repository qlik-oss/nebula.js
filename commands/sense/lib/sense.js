const buildLegacy = require('./build-legacy');
const build = require('./build');

function sense(argv) {
  if (argv.legacy) {
    return buildLegacy(argv);
  }
  return build(argv);
}
module.exports = sense;
