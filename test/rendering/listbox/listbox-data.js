window.getFuncs = function getFuncs() {
  return {
    getMockData: () => [
      {
        qMatrix: [
          [
            {
              qText: 'A',
              qNum: 'NaN',
              qElemNumber: 0,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'B',
              qNum: 'NaN',
              qElemNumber: 1,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'C',
              qNum: 'NaN',
              qElemNumber: 2,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'D',
              qNum: 'NaN',
              qElemNumber: 3,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'E',
              qNum: 'NaN',
              qElemNumber: 4,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'F',
              qNum: 'NaN',
              qElemNumber: 5,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'G',
              qNum: 'NaN',
              qElemNumber: 6,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'H',
              qNum: 'NaN',
              qElemNumber: 7,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'I',
              qNum: 'NaN',
              qElemNumber: 8,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'J',
              qNum: 'NaN',
              qElemNumber: 9,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'K',
              qNum: 'NaN',
              qElemNumber: 10,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'L',
              qNum: 'NaN',
              qElemNumber: 11,
              qState: 'O',
            },
          ],
        ],
        qTails: [],
        qArea: {
          qLeft: 0,
          qTop: 0,
          qWidth: 1,
          qHeight: 12,
        },
      },
      {
        qMatrix: [
          [
            {
              qText: 'A',
              qNum: 'NaN',
              qElemNumber: 0,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'B',
              qNum: 'NaN',
              qElemNumber: 1,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'C',
              qNum: 'NaN',
              qElemNumber: 2,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'D',
              qNum: 'NaN',
              qElemNumber: 3,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'E',
              qNum: 'NaN',
              qElemNumber: 4,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'F',
              qNum: 'NaN',
              qElemNumber: 5,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'G',
              qNum: 'NaN',
              qElemNumber: 6,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'H',
              qNum: 'NaN',
              qElemNumber: 7,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'I',
              qNum: 'NaN',
              qElemNumber: 8,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'J',
              qNum: 'NaN',
              qElemNumber: 9,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'K',
              qNum: 'NaN',
              qElemNumber: 10,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'L',
              qNum: 'NaN',
              qElemNumber: 11,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'M',
              qNum: 'NaN',
              qElemNumber: 12,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'N',
              qNum: 'NaN',
              qElemNumber: 13,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'O',
              qNum: 'NaN',
              qElemNumber: 14,
              qState: 'O',
            },
          ],
          [
            {
              qText: 'P',
              qNum: 'NaN',
              qElemNumber: 15,
              qState: 'O',
            },
          ],
        ],
        qTails: [],
        qArea: {
          qLeft: 0,
          qTop: 0,
          qWidth: 1,
          qHeight: 16,
        },
      },
    ],

    getListboxLayout: (options) => ({
      title: options?.title ?? 'Field title',
      qInfo: {
        qId: 'qId',
      },
      autoConfirm: options?.autoConfirm,
      visualization: 'listbox',
      qListObject: {
        qDimensionInfo: {
          qLocked: false,
          qStateCounts: {
            qOption: 0,
            qAlternative: 0,
            qExcluded: 0,
          },
        },
        qSize: {
          qcy: 16,
        },
        qInitialDataFetch: [{ qLeft: 0, qWidth: 0, qTop: 0, qHeight: 0 }],
      },
      qSelectionInfo: {
        qInSelections: false,
      },
      layoutOptions: {
        layoutOrder: 'row',
        dense: options?.dense ?? false,
      },
    }),
  };
};
