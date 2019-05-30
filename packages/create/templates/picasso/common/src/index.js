import picassojs from 'picasso.js';
import picassoQ from 'picasso-plugin-q';

import properties from './object-properties';
import data from './data';
import picSelections from './pic-selections';
import definition from './pic-definition';

export default function supernova(/* env */) {
  const picasso = picassojs();
  picasso.use(picassoQ);

  return {
    qae: {
      properties,
      data,
    },
    component: {
      created() {},
      mounted(element) {
        this.pic = picasso.chart({
          element,
          data: [],
          settings: {},
        });
        this.picsel = picSelections({
          selections: this.selections,
          brush: this.pic.brush('selection'),
          picassoQ,
        });
      },
      render({
        layout,
        context,
      }) {
        this.pic.update({
          data: [{
            type: 'q',
            key: 'qHyperCube',
            data: layout.qHyperCube,
          }],
          settings: definition({ layout, context }),
        });
      },
      resize() {},
      willUnmount() {},
      destroy() {},
    },
  };
}
