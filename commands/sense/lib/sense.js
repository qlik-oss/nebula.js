const buildLegacy = require('./build-legacy');
const build = require('./build');

function sense(argv) {
  if (argv.partial) {
    build(argv);
  } else {
    buildLegacy(argv);
  }
}
module.exports = sense;
