/* eslint-disable react-hooks/rules-of-hooks */
import { useLayout, useEffect, useElement, useModel } from '@nebula.js/stardust';
import { TableComponent } from './TableComponent';
import React from 'react';

export const mount = ({ element }) => {
  element.mount((props) => <TableComponent {...props} />);
};

export const render = ({ element, data }) => {
  element.renderComponent(data);
};

const sampleTable = (env) => {
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
        if (element) {
          console.log('mounting');
          mount({ element });
        }
      }, [element]);

      useEffect(() => {
        const data = { layout, model };
        render({ element, data });
      }, [element, layout, model]);
    },
  };
};

export default sampleTable;
