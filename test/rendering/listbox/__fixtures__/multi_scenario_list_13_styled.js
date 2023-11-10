const fixture = {
  // Override options.
  options: {
    components: [
      {
        key: 'theme',
        header: {
          fontColor: {
            index: -1,
            color: '#066e05',
          },
          fontSize: '24px',
        },
        content: {
          fontColor: {
            index: -1,
            color: '#22ff00',
          },
          fontSize: '16px',
          useContrastColor: true, // this should be ignored in listboxes with checkboxes
        },
      },
      {
        key: 'selections',
        colors: {
          selected: {
            index: -1,
            color: '#0000FF',
          },
          alternative: {
            index: -1,
            color: '#bec42c',
          },
          excluded: {
            index: -1,
            color: '#d1b557',
          },
          possible: {
            index: -1,
            color: '#59593a',
          },
          selectedExcluded: {
            index: -1,
            color: '#a9080a',
          },
        },
      },
    ],
  },
  getLayout: () => ({
    qInfo: {
      qId: 'b6bb4b41-739f-41b5-a9ea-ea0347621938',
      qType: 'listbox',
    },
    qMeta: {
      privileges: ['read', 'update', 'delete'],
    },
    qSelectionInfo: {},
    qListObject: {
      qSize: {
        qcx: 1,
        qcy: 17,
      },
      qDimensionInfo: {
        qFallbackTitle: 'Basket Product Group Desc',
        qApprMaxGlyphCount: 19,
        qCardinal: 17,
        qSortIndicator: 'A',
        qGroupFallbackTitles: ['Basket Product Group Desc'],
        qGroupPos: 0,
        qStateCounts: {
          qLocked: 0,
          qSelected: 0,
          qOption: 17,
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
        qGroupFieldDefs: ['Basket Product Group Desc'],
        qMin: 0,
        qMax: 0,
        qAttrExprInfo: [],
        qAttrDimInfo: [],
        qCardinalities: {
          qCardinal: 17,
          qHypercubeCardinal: 0,
          qAllValuesCardinal: -1,
        },
        qLibraryId: 'XGvpzM',
        title: 'Basket Product Group Desc',
        coloring: {
          changeHash: '0.45993295453224325',
          hasValueColors: false,
        },
        autoSort: true,
        cId: 'EENwNaq',
        textAlign: {
          auto: false,
          align: 'left',
        },
      },
      qExpressions: [],
      qDataPages: [],
      showTitles: true,
      title: '',
      subtitle: '',
      footnote: '',
      disableNavMenu: false,
      showDetails: true,
      showDetailsExpression: false,
      qOtherTotalSpec: {},
      frequencyEnabled: true,
    },
    showTitles: true,
    title: 'Basket Product Group Desc',
    subtitle: '',
    footnote: '',
    disableNavMenu: false,
    showDetails: true,
    showDetailsExpression: false,
    visualization: 'listbox',
    checkboxes: true,
    frequencyMax: 'fetch',
    histogram: true,
  }),

  evaluateEx: () => ({
    qText: '274',
    qIsNumeric: true,
    qNumber: 274,
  }),

  getListObjectData: () => [
    {
      qMatrix: [
        [
          {
            qText: 'Alcoholic Beverages',
            qNum: 'NaN',
            qElemNumber: 11,
            qState: 'O',
            qFrequency: '52',
          },
        ],
        [
          {
            qText: 'Baked Goods',
            qNum: 'NaN',
            qElemNumber: 13,
            qState: 'O',
            qFrequency: '52',
          },
        ],
        [
          {
            qText: 'Baking Goods',
            qNum: 'NaN',
            qElemNumber: 8,
            qState: 'S',
            qFrequency: '146',
          },
        ],
        [
          {
            qText: 'Beverages',
            qNum: 'NaN',
            qElemNumber: 7,
            qState: 'A',
            qFrequency: '134',
          },
        ],
        [
          {
            qText: 'Breakfast Foods',
            qNum: 'NaN',
            qElemNumber: 10,
            qState: 'X',
            qFrequency: '34',
          },
        ],
        [
          {
            qText: 'Canned Foods',
            qNum: 'NaN',
            qElemNumber: 2,
            qState: 'XS',
            qFrequency: '186',
          },
        ],
        [
          {
            qText: 'Canned Products',
            qNum: 'NaN',
            qElemNumber: 14,
            qState: 'O',
            qFrequency: '20',
          },
        ],
        [
          {
            qText: 'Dairy',
            qNum: 'NaN',
            qElemNumber: 5,
            qState: 'O',
            qFrequency: '174',
          },
        ],
        [
          {
            qText: 'Deli',
            qNum: 'NaN',
            qElemNumber: 3,
            qState: 'O',
            qFrequency: '120',
          },
        ],
        [
          {
            qText: 'Eggs',
            qNum: 'NaN',
            qElemNumber: 9,
            qState: 'O',
            qFrequency: '34',
          },
        ],
        [
          {
            qText: 'Frozen Foods',
            qNum: 'NaN',
            qElemNumber: 0,
            qState: 'O',
            qFrequency: '190',
          },
        ],
        [
          {
            qText: 'Meat',
            qNum: 'NaN',
            qElemNumber: 15,
            qState: 'O',
            qFrequency: '10',
          },
        ],
        [
          {
            qText: 'Produce',
            qNum: 'NaN',
            qElemNumber: 1,
            qState: 'O',
            qFrequency: '274',
          },
        ],
        [
          {
            qText: 'Seafood',
            qNum: 'NaN',
            qElemNumber: 16,
            qState: 'O',
            qFrequency: '12',
          },
        ],
        [
          {
            qText: 'Snack Foods',
            qNum: 'NaN',
            qElemNumber: 6,
            qState: 'O',
            qFrequency: '220',
          },
        ],
        [
          {
            qText: 'Snacks',
            qNum: 'NaN',
            qElemNumber: 12,
            qState: 'O',
            qFrequency: '50',
          },
        ],
        [
          {
            qText: 'Starchy Foods',
            qNum: 'NaN',
            qElemNumber: 4,
            qState: 'O',
            qFrequency: '46',
          },
        ],
      ],
      qTails: [],
      qArea: {
        qLeft: 0,
        qTop: 0,
        qWidth: 1,
        qHeight: 17,
      },
    },
    {
      qMatrix: [
        [
          {
            qText: 'Alcoholic Beverages',
            qNum: 'NaN',
            qElemNumber: 11,
            qState: 'O',
            qFrequency: '52',
          },
        ],
        [
          {
            qText: 'Baked Goods',
            qNum: 'NaN',
            qElemNumber: 13,
            qState: 'O',
            qFrequency: '52',
          },
        ],
        [
          {
            qText: 'Baking Goods',
            qNum: 'NaN',
            qElemNumber: 8,
            qState: 'O',
            qFrequency: '146',
          },
        ],
        [
          {
            qText: 'Beverages',
            qNum: 'NaN',
            qElemNumber: 7,
            qState: 'O',
            qFrequency: '134',
          },
        ],
        [
          {
            qText: 'Breakfast Foods',
            qNum: 'NaN',
            qElemNumber: 10,
            qState: 'O',
            qFrequency: '34',
          },
        ],
        [
          {
            qText: 'Canned Foods',
            qNum: 'NaN',
            qElemNumber: 2,
            qState: 'O',
            qFrequency: '186',
          },
        ],
        [
          {
            qText: 'Canned Products',
            qNum: 'NaN',
            qElemNumber: 14,
            qState: 'O',
            qFrequency: '20',
          },
        ],
        [
          {
            qText: 'Dairy',
            qNum: 'NaN',
            qElemNumber: 5,
            qState: 'O',
            qFrequency: '174',
          },
        ],
        [
          {
            qText: 'Deli',
            qNum: 'NaN',
            qElemNumber: 3,
            qState: 'O',
            qFrequency: '120',
          },
        ],
        [
          {
            qText: 'Eggs',
            qNum: 'NaN',
            qElemNumber: 9,
            qState: 'O',
            qFrequency: '34',
          },
        ],
        [
          {
            qText: 'Frozen Foods',
            qNum: 'NaN',
            qElemNumber: 0,
            qState: 'O',
            qFrequency: '190',
          },
        ],
        [
          {
            qText: 'Meat',
            qNum: 'NaN',
            qElemNumber: 15,
            qState: 'O',
            qFrequency: '10',
          },
        ],
        [
          {
            qText: 'Produce',
            qNum: 'NaN',
            qElemNumber: 1,
            qState: 'O',
            qFrequency: '274',
          },
        ],
        [
          {
            qText: 'Seafood',
            qNum: 'NaN',
            qElemNumber: 16,
            qState: 'O',
            qFrequency: '12',
          },
        ],
        [
          {
            qText: 'Snack Foods',
            qNum: 'NaN',
            qElemNumber: 6,
            qState: 'O',
            qFrequency: '220',
          },
        ],
        [
          {
            qText: 'Snacks',
            qNum: 'NaN',
            qElemNumber: 12,
            qState: 'O',
            qFrequency: '50',
          },
        ],
        [
          {
            qText: 'Starchy Foods',
            qNum: 'NaN',
            qElemNumber: 4,
            qState: 'O',
            qFrequency: '46',
          },
        ],
      ],
      qTails: [],
      qArea: {
        qLeft: 0,
        qTop: 0,
        qWidth: 1,
        qHeight: 17,
      },
    },
  ],
};

export default fixture;
