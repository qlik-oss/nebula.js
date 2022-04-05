import { useEffect, useElement, useLayout, useModel } from '@nebula.js/stardust';

const dataViewer = () => {
  return {
    qae: {
      data: {
        targets: [{ path: '/qHyperCubeDef' }],
      },
      properties: {
        qHyperCubeDef: {},
      },
    },
    component() {
      const element = useElement();
      const layout = useLayout();
      const model = useModel();
      useEffect(() => {
        const data = { layout, model };
        console.log('YOYOYOYOYO dataViewer says: ', data);
      }, [element, layout, model]);
    },
  };
};

export default dataViewer;
