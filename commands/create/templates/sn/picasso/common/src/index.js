import {
  useElement,
  useState,
  useStaleLayout,
  useSelections,
  useRect,
  useEffect,
  useConstraints,
} from '@nebula.js/stardust';
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
    component() {
      const element = useElement();
      const selections = useSelections();
      const layout = useStaleLayout();
      const rect = useRect();
      const constraints = useConstraints();

      const [instance, setInstance] = useState();

      useEffect(() => {
        const p = picasso.chart({
          element,
          data: [],
          settings: {},
        });

        const s = picSelections({
          selections,
          brush: p.brush('selection'),
          picassoQ,
        });

        setInstance(p);

        return () => {
          s.release();
          p.destroy();
        };
      }, []);

      useEffect(() => {
        if (!instance) {
          return;
        }
        instance.update({
          data: [
            {
              type: 'q',
              key: 'qHyperCube',
              data: layout.qHyperCube,
            },
          ],
          settings: definition({ layout, constraints }),
        });
      }, [layout, instance]);

      useEffect(() => {
        if (!instance) {
          return;
        }
        instance.update();
      }, [rect.width, rect.height, instance]);
    },
  };
}
