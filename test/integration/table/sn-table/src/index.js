import { useElement, useLayout, useEffect } from '@nebula.js/stardust';

import data from './data.json';
import './style.css';

export default function v() {
  return {
    qae: {
      properties: {
        dimensionName: 'The first one',
        layers: [
          {
            qHyperCubeDef: {
              qInitialDataFetch: [{ qLeft: 0, qWidth: 4, qTop: 0, qHeight: 10 }],
            },
          },
        ],
      },
      data: {
        targets: [
          {
            path: '/layers/0/qHyperCubeDef',
            dimensions: {
              min: 1,
              max: 1,
              description(props) {
                return props.dimensionName;
              },
            },
            measures: { max: () => 3 },
          },
        ],
      },
    },
    component() {
      const element = useElement();
      const layout = useLayout();

      useEffect(() => {
        const hc = layout.layers[0].qHyperCube;

        // headers
        const columns = [...hc.qDimensionInfo, ...hc.qMeasureInfo].map((f) => f.qFallbackTitle);
        const header = `<thead><tr>${columns.map((c) => `<th>${c}</th>`).join('')}</tr></thead>`;

        // rows
        const rows = hc.qDataPages[0].qMatrix
          .map((row) => `<tr>${row.map((cell) => `<td>${cell.qText}</td>`).join('')}</tr>`)
          .join('');

        // table
        const table = `<table>${header}<tbody>${rows}</tbody></table>`;

        // output
        element.innerHTML = `
        <div class="simple-table">
          <div class="hello">A simple table</div>
          <div class="json-value">${data.v}</div>
          <div class="table">${table}</div>
        </div>
      `;
      }, [element, layout]);
    },
  };
}
