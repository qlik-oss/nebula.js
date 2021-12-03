export default function fixture() {
  return {
    type: 'hi',
    genericObjects: [
      {
        getLayout() {
          return {
            qInfo: {
              qId: '4a3c0f05-f736-47df-b8de-421c5c59167c',
              qType: 'hi',
            },
            qMeta: {
              privileges: ['read', 'update', 'delete', 'exportdata'],
            },
            qSelectionInfo: {},
            visualization: 'hi',
            showTitles: true,
            dimensionName: 'The first one',
            layers: [
              {
                qHyperCube: {
                  qSize: {
                    qcx: 1,
                    qcy: 26,
                  },
                  qDimensionInfo: [
                    {
                      qFallbackTitle: 'Alpha',
                      qApprMaxGlyphCount: 1,
                      qCardinal: 26,
                      qSortIndicator: 'A',
                      qGroupFallbackTitles: ['Alpha'],
                      qGroupPos: 0,
                      qStateCounts: {
                        qLocked: 0,
                        qSelected: 0,
                        qOption: 26,
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
                      qMin: 'NaN',
                      qMax: 'NaN',
                      qAttrExprInfo: [],
                      qAttrDimInfo: [],
                      qCardinalities: {
                        qCardinal: 26,
                        qHypercubeCardinal: 0,
                        qAllValuesCardinal: -1,
                      },
                      cId: 'cbse7g',
                    },
                  ],
                  qMeasureInfo: [],
                  qEffectiveInterColumnSortOrder: [0],
                  qGrandTotalRow: [],
                  qDataPages: [
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
                      ],
                      qTails: [
                        {
                          qUp: 0,
                          qDown: 0,
                        },
                      ],
                      qArea: {
                        qLeft: 0,
                        qTop: 0,
                        qWidth: 1,
                        qHeight: 10,
                      },
                    },
                  ],
                  qPivotDataPages: [],
                  qStackedDataPages: [],
                  qMode: 'S',
                  qNoOfLeftDims: -1,
                  qTreeNodesOnDim: [],
                  qColumnOrder: [],
                },
              },
            ],
          };
        },
      },
    ],
  };
}
