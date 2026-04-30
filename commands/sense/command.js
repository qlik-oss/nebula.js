import init from './lib/init-config';
import sense from './lib/sense';

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
