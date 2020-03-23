import nucleus from '@nebula.js/nucleus/dist/nucleus';

import barchart from '@nebula.js/sn-bar-chart';

const n = nucleus.createConfiguration({
  context: {
    theme: 'light',
    language: 'en-US',
  },
  types: [
    {
      name: 'barchart',
      load: () => Promise.resolve(barchart),
    },
  ],
});

export default n;
