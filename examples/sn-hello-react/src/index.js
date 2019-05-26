import properties from './object-properties';
import data from './data';

import { render, teardown } from './components/root';

export default function supernova(/* env */) {
  return {
    qae: {
      properties,
      data,
    },
    component: {
      mounted(element) {
        this.element = element;
      },
      render({
        layout,
        context,
      }) {
        render(this.element, { layout, context });
      },
      resize() {},
      willUnmount() {
        teardown(this.element);
      },
      destroy() {},
    },
  };
}
