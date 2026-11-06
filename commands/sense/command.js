import init from './lib/init-config.js';
import sense from './lib/sense.js';

export default {
  command: 'sense',
  desc: 'Build a nebula visualization as a Qlik Sense extension',
  builder(yargs) {
    // a flag that it does not know of is an error, a misspelled one would otherwise do nothing
    return init(yargs).strictOptions();
  },
  handler(argv) {
    sense(argv);
  },
};
