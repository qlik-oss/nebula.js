const listdef = {
  qInfo: {
    qType: 'njsListbox',
  },
  qListObjectDef: {
    qStateName: '',
    qShowAlternatives: true,
    frequencyEnabled: false,
    qFrequencyMode: 'N',
    qInitialDataFetch: [
      {
        qTop: 0,
        qLeft: 0,
        qWidth: 0,
        qHeight: 0,
      },
    ],
    qDef: {
      qSortCriterias: [
        {
          qSortByState: 1,
          qSortByAscii: 1,
          qSortByNumeric: 1,
          qSortByLoadOrder: 1,
        },
      ],
    },
  },
  histogram: false,
  checkboxes: false,
  layoutOptions: {
    dense: false,
    dataLayout: 'singleColumn',
    layoutOrder: 'row',
    maxVisibleColumns: { auto: true },
    maxVisibleRows: { auto: true },
  },
  title: '',
};
export default listdef;
