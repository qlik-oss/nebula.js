import build from './lib/build.js';
import init from './lib/init-config.js';

export default {
  command: 'build',
  desc: 'Build visualization',
  builder(yargs) {
    init(yargs).argv;
  },
  handler(argv) {
    build(argv);
  },
};
