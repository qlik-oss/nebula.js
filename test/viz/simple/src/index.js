import { useElement, useLayout } from '@nebula.js/stardust';

import data from './data.json';
import './style.css';

export default function v() {
  return {
    qae: {
      properties: {
        v: {
          qValueExpression: {
            qExpr: '1+2',
          },
        },
      },
    },
    component() {
      const element = useElement();
      const layout = useLayout();
      element.innerHTML = `
        <div class="simple-viz">
          <div class="hello">Hello engine!</div>
          <div class="json-value">${data.v}</div>
          <div class="layout-value">${layout.v}</div>
        </div>
      `;
    },
  };
}
