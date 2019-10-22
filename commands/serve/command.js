const serve = require('./lib/serve');
const init = require('./init-config');

module.exports = {
  command: 'serve',
  desc: 'Dev server',
  builder(yargs) {
    init(yargs).argv;
  },
  handler(argv) {
    serve(argv);
  },
};
