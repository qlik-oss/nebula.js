import { useElement, useLayout, useEffect } from '@nebula.js/stardust';

import { render, teardown } from './components/root';

export default function supernova() {
  return {
    qae: {
      properties: {},
    },
    component() {
      const element = useElement();
      const layout = useLayout();

      useEffect(() => {
        const root = render(element, { layout });
        return () => teardown(root);
      }, [element, layout]);
    },
  };
}
