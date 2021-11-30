/* eslint import/no-extraneous-dependencies: 0 */

import { useEffect, useElement, useLayout } from '@nebula.js/stardust';
import picassojs from 'picasso.js';
import picassoQ from 'picasso-plugin-q';

import properties from './object-properties';
import definition from './pic-definition';

export default function supernova(/* env */) {
  const picasso = picassojs();
  picasso.use(picassoQ);

  return {
    qae: {
      properties,
    },
    component() {
      const element = useElement();
      const layout = useLayout();

      useEffect(() => {
        const picassoInstance = picasso.chart({
          element,
          data: [],
          settings: {},
        });
        picassoInstance.update({
          data: [
            {
              type: 'q',
              key: 'qHyperCube',
              data: layout.qHyperCube,
            },
          ],
          settings: definition({ layout }),
        });
      }, []);
    },
  };
}
