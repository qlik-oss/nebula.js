const serve = require('./lib/serve');
const init = require('./lib/init-config');

module.exports = {
  command: 'serve',
  desc: 'Start a development server',
  builder(yargs) {
    init(yargs).argv;
  },
  handler(argv) {
    serve(argv);
  },
};
