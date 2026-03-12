/* eslint-disable import/extensions */
import serve from './lib/serve.js';
import init from './lib/init-config.js';

export default {
  command: 'serve',
  desc: 'Start a development server',
  builder(yargs) {
    init(yargs).argv;
  },
  handler(argv) {
    serve(argv);
  },
};
