const fixture = {
  getLayout: () => ({
    title: 'Field title with truncated text that is very long',
    qInfo: {
      qId: 'qId',
    },
    visualization: 'listbox',
    qListObject: {
      qDimensionInfo: {
        qGrouping: 'H',
      },
      qSize: {
        qcy: 2,
      },
      qInitialDataFetch: [{ qLeft: 0, qWidth: 0, qTop: 0, qHeight: 0 }],
    },
    qSelectionInfo: {
      qInSelections: false,
    },
    layoutOptions: {
      layoutOrder: 'row',
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
      ],
      qTails: [],
      qArea: {
        qLeft: 0,
        qTop: 0,
        qWidth: 1,
        qHeight: 2,
      },
    },
  ],
};

export default fixture;
