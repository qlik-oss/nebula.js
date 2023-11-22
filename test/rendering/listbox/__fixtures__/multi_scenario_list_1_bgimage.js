const fixture = {
  // Override options.
  options: {
    components: [
      {
        key: 'theme',
        background: {
          color: {
            color: 'orange',
            index: -1,
          },
          image: {
            mode: 'media',
            mediaUrl: {
              qStaticContentUrl: {
                qUrl: './__fixtures__/resources/snowy_street.jpg',
              },
            },
            position: 'center-center',
            sizing: 'stretchFit',
          },
        },
        header: {
          fontColor: {
            index: -1,
            color: 'white',
          },
          fontSize: '24px',
          fontFamily: '"Pacifico, cursive"',
        },
        content: {
          fontColor: {
            index: -1,
            color: 'black', // should become white/light since useContrastColor is true and darkblue is possible selection state background
          },
          fontSize: '16px',
          fontFamily: '"Pacifico, cursive"',
          useContrastColor: true,
        },
      },
      {
        key: 'selections',
        colors: {
          possible: {
            index: -1,
            color: 'darkblue',
          },
        },
      },
    ],
  },
  getLayout: () => ({
    qInfo: {
      qId: '04d74811-ce39-4283-8340-242ee6c026df',
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
        cId: 'sxXUPR',
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
    },
    showTitles: true,
    title: 'Basket Product Group Desc',
    subtitle: '',
    footnote: '',
    disableNavMenu: false,
    showDetails: true,
    showDetailsExpression: false,
    visualization: 'listbox',
    layoutOptions: {
      dense: true,
    },
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
          },
        ],
        [
          {
            qText: 'Baked Goods',
            qNum: 'NaN',
            qElemNumber: 13,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Baking Goods',
            qNum: 'NaN',
            qElemNumber: 8,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Beverages',
            qNum: 'NaN',
            qElemNumber: 7,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Breakfast Foods',
            qNum: 'NaN',
            qElemNumber: 10,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Canned Foods',
            qNum: 'NaN',
            qElemNumber: 2,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Canned Products',
            qNum: 'NaN',
            qElemNumber: 14,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Dairy',
            qNum: 'NaN',
            qElemNumber: 5,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Deli',
            qNum: 'NaN',
            qElemNumber: 3,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Eggs',
            qNum: 'NaN',
            qElemNumber: 9,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Frozen Foods',
            qNum: 'NaN',
            qElemNumber: 0,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Meat',
            qNum: 'NaN',
            qElemNumber: 15,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Produce',
            qNum: 'NaN',
            qElemNumber: 1,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Seafood',
            qNum: 'NaN',
            qElemNumber: 16,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Snack Foods',
            qNum: 'NaN',
            qElemNumber: 6,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Snacks',
            qNum: 'NaN',
            qElemNumber: 12,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Starchy Foods',
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
          },
        ],
        [
          {
            qText: 'Baked Goods',
            qNum: 'NaN',
            qElemNumber: 13,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Baking Goods',
            qNum: 'NaN',
            qElemNumber: 8,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Beverages',
            qNum: 'NaN',
            qElemNumber: 7,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Breakfast Foods',
            qNum: 'NaN',
            qElemNumber: 10,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Canned Foods',
            qNum: 'NaN',
            qElemNumber: 2,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Canned Products',
            qNum: 'NaN',
            qElemNumber: 14,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Dairy',
            qNum: 'NaN',
            qElemNumber: 5,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Deli',
            qNum: 'NaN',
            qElemNumber: 3,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Eggs',
            qNum: 'NaN',
            qElemNumber: 9,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Frozen Foods',
            qNum: 'NaN',
            qElemNumber: 0,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Meat',
            qNum: 'NaN',
            qElemNumber: 15,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Produce',
            qNum: 'NaN',
            qElemNumber: 1,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Seafood',
            qNum: 'NaN',
            qElemNumber: 16,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Snack Foods',
            qNum: 'NaN',
            qElemNumber: 6,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Snacks',
            qNum: 'NaN',
            qElemNumber: 12,
            qState: 'O',
          },
        ],
        [
          {
            qText: 'Starchy Foods',
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
        qHeight: 17,
      },
    },
  ],
};

export default fixture;
