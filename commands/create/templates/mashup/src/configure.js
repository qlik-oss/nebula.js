import { embed } from '@nebula.js/stardust';

import barchart from '@nebula.js/sn-bar-chart';

const n = embed.createConfiguration({
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
