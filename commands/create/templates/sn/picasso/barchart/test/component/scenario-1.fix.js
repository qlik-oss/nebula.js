export default function fixture() {
  return {
    type: 'barchart',
    genericObjects: [
      {
        getLayout() {
          return {
            qInfo: {
              qId: 'fb320913-0264-4e2a-ad1b-225170dbaef6',
              qType: 'barchart',
            },
            qMeta: {
              privileges: ['read', 'update', 'delete', 'exportdata'],
            },
            qSelectionInfo: {},
            visualization: 'barchart',
            showTitles: true,
            qHyperCube: {
              qSize: {
                qcx: 2,
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
                    qHypercubeCardinal: 26,
                    qAllValuesCardinal: -1,
                  },
                  cId: 'gduah5',
                },
              ],
              qMeasureInfo: [
                {
                  qFallbackTitle: '=5+avg(Expression1)',
                  qApprMaxGlyphCount: 5,
                  qCardinal: 0,
                  qSortIndicator: 'D',
                  qNumFormat: {
                    qType: 'R',
                    qnDec: 0,
                    qUseThou: 0,
                    qFmt: '##############',
                    qDec: '.',
                    qThou: ',',
                  },
                  qMin: 6,
                  qMax: 453.5,
                  qIsAutoFormat: true,
                  qAttrExprInfo: [],
                  qAttrDimInfo: [],
                  qTrendLines: [],
                  cId: 'fsorka',
                },
              ],
              qEffectiveInterColumnSortOrder: [0, 1],
              qGrandTotalRow: [
                {
                  qText: '148.7',
                  qNum: 148.7,
                  qElemNumber: -1,
                  qState: 'X',
                  qIsTotalCell: true,
                },
              ],
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
                      {
                        qText: '-',
                        qNum: 'NaN',
                        qElemNumber: 0,
                        qState: 'L',
                        qIsNull: true,
                      },
                    ],
                    [
                      {
                        qText: 'B',
                        qNum: 'NaN',
                        qElemNumber: 1,
                        qState: 'O',
                      },
                      {
                        qText: '87',
                        qNum: 87,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'C',
                        qNum: 'NaN',
                        qElemNumber: 2,
                        qState: 'O',
                      },
                      {
                        qText: '285',
                        qNum: 285,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'D',
                        qNum: 'NaN',
                        qElemNumber: 3,
                        qState: 'O',
                      },
                      {
                        qText: '95',
                        qNum: 95,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'E',
                        qNum: 'NaN',
                        qElemNumber: 4,
                        qState: 'O',
                      },
                      {
                        qText: '30.5',
                        qNum: 30.5,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'F',
                        qNum: 'NaN',
                        qElemNumber: 5,
                        qState: 'O',
                      },
                      {
                        qText: '78',
                        qNum: 78,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'G',
                        qNum: 'NaN',
                        qElemNumber: 6,
                        qState: 'O',
                      },
                      {
                        qText: '126',
                        qNum: 126,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'H',
                        qNum: 'NaN',
                        qElemNumber: 7,
                        qState: 'O',
                      },
                      {
                        qText: '327.33333333333',
                        qNum: 327.3333333333333,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'I',
                        qNum: 'NaN',
                        qElemNumber: 8,
                        qState: 'O',
                      },
                      {
                        qText: '6',
                        qNum: 6,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'J',
                        qNum: 'NaN',
                        qElemNumber: 9,
                        qState: 'O',
                      },
                      {
                        qText: '102',
                        qNum: 102,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'K',
                        qNum: 'NaN',
                        qElemNumber: 10,
                        qState: 'O',
                      },
                      {
                        qText: '273',
                        qNum: 273,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'L',
                        qNum: 'NaN',
                        qElemNumber: 11,
                        qState: 'O',
                      },
                      {
                        qText: '241.8',
                        qNum: 241.8,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'M',
                        qNum: 'NaN',
                        qElemNumber: 12,
                        qState: 'O',
                      },
                      {
                        qText: '12',
                        qNum: 12,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'N',
                        qNum: 'NaN',
                        qElemNumber: 13,
                        qState: 'O',
                      },
                      {
                        qText: '34',
                        qNum: 34,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'O',
                        qNum: 'NaN',
                        qElemNumber: 14,
                        qState: 'O',
                      },
                      {
                        qText: '49.4',
                        qNum: 49.4,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'P',
                        qNum: 'NaN',
                        qElemNumber: 15,
                        qState: 'O',
                      },
                      {
                        qText: '87.666666666667',
                        qNum: 87.66666666666667,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'Q',
                        qNum: 'NaN',
                        qElemNumber: 16,
                        qState: 'O',
                      },
                      {
                        qText: '453.5',
                        qNum: 453.5,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'R',
                        qNum: 'NaN',
                        qElemNumber: 17,
                        qState: 'O',
                      },
                      {
                        qText: '33',
                        qNum: 33,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'S',
                        qNum: 'NaN',
                        qElemNumber: 18,
                        qState: 'O',
                      },
                      {
                        qText: '49',
                        qNum: 49,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'T',
                        qNum: 'NaN',
                        qElemNumber: 19,
                        qState: 'O',
                      },
                      {
                        qText: '64',
                        qNum: 64,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'U',
                        qNum: 'NaN',
                        qElemNumber: 20,
                        qState: 'O',
                      },
                      {
                        qText: '46',
                        qNum: 46,
                        qElemNumber: 0,
                        qState: 'L',
                      },
                    ],
                    [
                      {
                        qText: 'V',
                        qNum: 'NaN',
                        qElemNumber: 21,
                        qState: 'O',
                      },
                      {
                        qText: '-',
                        qNum: 'NaN',
                        qElemNumber: 0,
                        qState: 'L',
                        qIsNull: true,
                      },
                    ],
                    [
                      {
                        qText: 'W',
                        qNum: 'NaN',
                        qElemNumber: 22,
                        qState: 'O',
                      },
                      {
                        qText: '-',
                        qNum: 'NaN',
                        qElemNumber: 0,
                        qState: 'L',
                        qIsNull: true,
                      },
                    ],
                    [
                      {
                        qText: 'X',
                        qNum: 'NaN',
                        qElemNumber: 23,
                        qState: 'O',
                      },
                      {
                        qText: '-',
                        qNum: 'NaN',
                        qElemNumber: 0,
                        qState: 'L',
                        qIsNull: true,
                      },
                    ],
                    [
                      {
                        qText: 'Y',
                        qNum: 'NaN',
                        qElemNumber: 24,
                        qState: 'O',
                      },
                      {
                        qText: '-',
                        qNum: 'NaN',
                        qElemNumber: 0,
                        qState: 'L',
                        qIsNull: true,
                      },
                    ],
                    [
                      {
                        qText: 'Z',
                        qNum: 'NaN',
                        qElemNumber: 25,
                        qState: 'O',
                      },
                      {
                        qText: '-',
                        qNum: 'NaN',
                        qElemNumber: 0,
                        qState: 'L',
                        qIsNull: true,
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
                    qWidth: 2,
                    qHeight: 26,
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
            title: '',
            subtitle: '',
            footnote: '',
          };
        },
      },
    ],
  };
}
