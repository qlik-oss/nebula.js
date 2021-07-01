const init = require('./lib/init-config');
const sense = require('./lib/sense');

module.exports = {
  command: 'sense',
  desc: 'Build a nebula visualization as a Qlik Sense extension',
  builder(yargs) {
    init(yargs);
  },
  handler(argv) {
    sense(argv);
  },
};
