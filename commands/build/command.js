/* eslint-disable import/extensions */
import build from './lib/build.js';
import init from './lib/init-config.js';

export default {
  command: 'build',
  desc: 'Build visualization',
  builder(yargs) {
    // only this command refuses what it does not know of, a flag that is misspelled would otherwise do nothing
    init(yargs).strictOptions().argv;
  },
  handler(argv) {
    build(argv);
  },
};
