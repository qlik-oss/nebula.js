import serve from './lib/serve';
import init from './lib/init-config';

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
