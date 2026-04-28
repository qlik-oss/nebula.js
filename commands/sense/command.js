import init from './lib/init-config.js';
import sense from './lib/sense.js';

export default {
  command: 'sense',
  desc: 'Build a nebula visualization as a Qlik Sense extension',
  builder(yargs) {
    init(yargs);
  },
  handler(argv) {
    sense(argv);
  },
};
