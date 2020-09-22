import { useElement, useLayout, useEffect, useState, useSelections } from '@nebula.js/stardust';

export default function v() {
  return {
    qae: {
      properties: {
        dimensionName: 'The first one',
        foo: {
          qListObjectDef: {
            qShowAlternatives: true,
            qInitialDataFetch: [
              {
                qLeft: 0,
                qWidth: 1,
                qTop: 0,
                qHeight: 100,
              },
            ],
          },
          qDef: {
            qSortCriterias: [
              {
                qSortByState: 1,
                qSortByAscii: 1,
                qSortByNumeric: 1,
                qSortByLoadOrder: 1,
              },
            ],
          },
        },
      },
      data: {
        targets: [
          {
            path: '/foo/qListObjectDef',
            dimensions: {
              min: 1,
              max: 1,
              description() {
                return 'Your field';
              },
            },
          },
        ],
      },
    },
    component() {
      const element = useElement();
      const layout = useLayout();
      const selections = useSelections();
      const [selectedRows, setSelectedRows] = useState([]);

      useEffect(() => {
        const listener = (e) => {
          if (e.target.tagName === 'TD') {
            if (!selections.isActive()) {
              selections.begin('/foo/qListObjectDef');
            }
            const row = +e.target.parentElement.getAttribute('data-row');
            const elemNumber = layout.foo.qListObject.qDataPages[0].qMatrix[row][0].qElemNumber;
            setSelectedRows((prev) => {
              if (prev.includes(elemNumber)) {
                return prev.filter((pe) => pe !== elemNumber);
              }
              return [...prev, elemNumber];
            });
          }
        };

        element.addEventListener('click', listener);

        return () => {
          element.removeEventListener('click', listener);
        };
      }, [element]);

      useEffect(() => {
        const lo = layout.foo.qListObject;

        // headers
        const columns = [lo.qDimensionInfo.qFallbackTitle];
        const header = `<thead><tr>${columns.map((c) => `<th>${c}</th>`).join('')}</tr></thead>`;

        const STATES = {
          S: {
            background: 'rgba(0, 255, 0, 0.85)',
          },
          A: {
            background: 'rgba(0, 0, 0, 0.3)',
          },
        };

        // rows
        const rows = lo.qDataPages[0].qMatrix
          .map(
            (row, ix) =>
              `<tr data-row=${ix}>${row
                .map(
                  (cell) =>
                    `<td style="background:${
                      // eslint-disable-next-line no-nested-ternary
                      cell.qState === 'S' || cell.qState === 'L'
                        ? STATES.S.background
                        : cell.qState === 'A'
                        ? STATES.A.background
                        : 'none'
                    }">${cell.qText}</td>`
                )
                .join('')}</tr>`
          )
          .join('');

        // table
        const table = `<table>${header}<tbody>${rows}</tbody></table>`;

        // output
        element.innerHTML = table;
      }, [element, layout]);

      useEffect(() => {
        if (selections.isActive()) {
          if (selectedRows.length) {
            selections.select({
              method: 'selectListObjectValues',
              params: ['/foo/qListObjectDef', selectedRows, false],
            });
          } else {
            selections.select({
              method: 'resetMadeSelections',
              params: [],
            });
          }
        } else if (selectedRows.length) {
          setSelectedRows([]);
        }
      }, [selections.isActive(), selectedRows]);
    },
  };
}
