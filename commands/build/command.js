import build from './lib/build.js';
import init from './lib/init-config.js';

export default {
  command: 'build',
  desc: 'Build visualization',
  builder(yargs) {
    // a flag or a key of the config file that it does not know of is an error, a misspelled one would otherwise do nothing
    init(yargs).strictOptions().argv;
  },
  handler(argv) {
    build(argv);
  },
};
