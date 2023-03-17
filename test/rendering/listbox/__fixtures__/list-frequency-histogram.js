const fixture = {
  getLayout: () => ({
    title: 'Field title',
    qInfo: {
      qId: 'qId',
    },
    visualization: 'listbox',
    qListObject: {
      qDimensionInfo: {
        qLocked: false,
      },
      qSize: {
        qcy: 8,
      },
      qInitialDataFetch: [{ qLeft: 0, qWidth: 0, qTop: 0, qHeight: 0 }],
      qFrequencyMode: 'P',
      frequencyEnabled: true,
    },
    qSelectionInfo: {
      qInSelections: false,
    },
    histogram: true,
    layoutOptions: {
      dataLayout: 'singleColumn',
    },
  }),
  getListObjectData: () => [
    {
      qMatrix: [
        [
          {
            qText: 'A',
            qNum: 'NaN',
            qElemNumber: 0,
            qState: 'L',
            qFrequency: '20%',
          },
        ],
        [
          {
            qText: 'B',
            qNum: 'NaN',
            qElemNumber: 1,
            qState: 'A',
            qFrequency: '75%',
          },
        ],
        [
          {
            qText: 'C',
            qNum: 'NaN',
            qElemNumber: 2,
            qState: 'S',
            qFrequency: '10%',
          },
        ],
        [
          {
            qText: 'D',
            qNum: 'NaN',
            qElemNumber: 3,
            qState: 'XL',
            qFrequency: '100%',
          },
        ],
        [
          {
            qText: 'E',
            qNum: 'NaN',
            qElemNumber: 4,
            qState: 'A',
            qFrequency: '0.0%',
          },
        ],
        [
          {
            qText: 'F',
            qNum: 'NaN',
            qElemNumber: 5,
            qState: 'A',
            qFrequency: '50%',
          },
        ],
        [
          {
            qText: 'G',
            qNum: 'NaN',
            qElemNumber: 6,
            qState: 'A',
            qFrequency: '10%',
          },
        ],
        [
          {
            qText: 'H',
            qNum: 'NaN',
            qElemNumber: 7,
            qState: 'O',
            qFrequency: '75%',
          },
        ],
      ],
      qTails: [],
      qArea: {
        qLeft: 0,
        qTop: 0,
        qWidth: 1,
        qHeight: 8,
      },
    },
  ],
};

export default fixture;
