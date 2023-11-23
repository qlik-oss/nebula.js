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
    getSheetLayout2: () => {
      return {
        qInfo: {
          qId: 'boundLessSheet',
        },
        columns: 10,
        rows: 10,
        visualization: 'sheet',
        cells: [
          {
            name: 'bar',
            col: 0,
            colspan: 4,
            row: 0,
            rowspan: 5,
          },
          {
            name: 'pie',
            col: 5,
            colspan: 4,
            row: 5,
            rowspan: 5,
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
        title: 'This is the title of the barchart',
        subtitle: 'here is the subtitle',
        footnote: 'and here is a footnote',
        showTitles: true,
        components: [
          {
            key: 'general',
            title: {
              main: {
                color: { color: 'green' },
                fontFamily: 'Verdana',
              },
              subTitle: {
                color: { color: 'blue' },
                fontStyle: ['bold', 'italic', 'underline'],
              },
              footer: {
                color: { color: 'red' },
                fontFamily: 'Lucida Console, monospace',
              },
            },
            bgColor: {
              color: { color: '#00ff00' },
            },
          },
        ],
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
