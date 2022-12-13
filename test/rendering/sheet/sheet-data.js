/* eslint arrow-body-style: 0 */

window.getFuncs = function getFuncs() {
  return {
    getSheetLayout: () => {
      return {
        qInfo: {
          qId: 'sheet',
        },
        visualization: 'sheet',
        cells: [
          {
            name: 'bar',
            bounds: {
              x: 0,
              y: 0,
              width: 50,
              height: 50,
            },
          },
          {
            name: 'pie',
            bounds: {
              x: 50,
              y: 50,
              width: 50,
              height: 50,
            },
          },
        ],
      };
    },
    getBarLayout: () => {
      return {
        qInfo: {
          qId: 'bar',
        },
        visualization: 'barchart',
      };
    },
    getPieLayout: () => {
      return {
        qInfo: {
          qId: 'pie',
        },
        visualization: 'piechart',
      };
    },
  };
};
