/* eslint-disable import/extensions */
import init from './lib/init-config.js';
import validate from './lib/validate.js';

export default {
  command: 'validate',
  desc: 'Validate a nebula visualization extension',
  builder(yargs) {
    init(yargs).argv;
  },
  async handler(argv) {
    const result = await validate(argv);
    if (!result.ok) {
      process.exitCode = 1;
    }
  },
};
