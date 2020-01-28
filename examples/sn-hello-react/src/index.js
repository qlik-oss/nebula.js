import { useElement, useLayout, useEffect } from '@nebula.js/supernova';

import properties from './object-properties';
import data from './data';

import { render, teardown } from './components/root';

export default function supernova(/* env */) {
  return {
    qae: {
      properties,
      data,
    },
    component() {
      const el = useElement();
      const layout = useLayout();

      useEffect(
        () => () => {
          teardown(el);
        },
        []
      );

      render(el, { layout });
    },
  };
}
