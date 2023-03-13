const fixture = {
  getLayout: () => ({
    qInfo: {
      qId: 'qId',
    },
    qMeta: {
      privileges: ['read', 'update', 'delete', 'exportdata'],
    },
    qSelectionInfo: {},
    qListObject: {
      qStateName: '$',
      qSize: {
        qcx: 1,
        qcy: 5,
      },
      qDimensionInfo: {
        qFallbackTitle: 'Alpha',
        qApprMaxGlyphCount: 1,
        qCardinal: 5,
        qSortIndicator: 'A',
        qGroupFallbackTitles: ['Alpha'],
        qGroupPos: 0,
        qStateCounts: {
          qLocked: 0,
          qSelected: 0,
          qOption: 5,
          qDeselected: 0,
          qAlternative: 0,
          qExcluded: 0,
          qSelectedExcluded: 0,
          qLockedExcluded: 0,
        },
        qTags: ['$ascii', '$text'],
        qDimensionType: 'D',
        qGrouping: 'N',
        qNumFormat: {
          qType: 'U',
          qnDec: 0,
          qUseThou: 0,
        },
        qIsAutoFormat: true,
        qGroupFieldDefs: ['Alpha'],
        qMin: 0,
        qMax: 0,
        qAttrExprInfo: [],
        qAttrDimInfo: [],
        qCardinalities: {
          qCardinal: 5,
          qHypercubeCardinal: 0,
          qAllValuesCardinal: -1,
        },
      },
      qExpressions: [],
      qDataPages: [
        {
          qMatrix: [],
          qTails: [],
          qArea: {
            qLeft: 0,
            qTop: 0,
            qWidth: 1,
            qHeight: 0,
          },
        },
      ],
      frequencyEnabled: false,
    },
    histogram: false,
    layoutOptions: {
      dataLayout: 'grid',
      layoutOrder: 'column',
      maxVisibleColumns: {
        auto: true,
      },
      maxVisibleRows: {
        auto: false,
        maxRows: 1,
      },
    },
    title: 'Alpha',
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
      ],
      qTails: [],
      qArea: {
        qLeft: 0,
        qTop: 0,
        qWidth: 1,
        qHeight: 5,
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
      ],
      qTails: [],
      qArea: {
        qLeft: 0,
        qTop: 0,
        qWidth: 1,
        qHeight: 5,
      },
    },
  ],
};

export default fixture;
