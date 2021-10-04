const buildLegacy = require('./build-legacy');
const build = require('./build');

function sense(argv) {
  if (argv.legacy) {
    buildLegacy(argv);
  } else {
    build(argv);
  }
}
module.exports = sense;
