import * as uidModule from '../uid';
import handler from '../filterpane-handler';

describe('filterpane-handler', () => {
  let children;
  let halo;
  let h;

  beforeEach(() => {
    jest.spyOn(uidModule, 'default').mockImplementation(() => 'uid');
    const dimensionModel = {
      getProperties: async () => ({
        qDim: {
          title: 'lib dim title',
        },
      }),
    };
    halo = {
      app: {
        getDimension: async () => dimensionModel,
      },
    };
    children = [];

    h = handler({
      halo,
      children,
    });
  });

  describe('add dimension', () => {
    test('from string', async () => {
      await h.addDimension('A');
      expect(children).toEqual([
        {
          qChildren: [],
          qProperty: {
            qInfo: {
              qType: expect.any(String),
            },
            title: 'A',
            searchEnabled: true,
            showTitle: true,
            wildCardSearch: false,
            checkboxes: false,
            histogram: false,
            autoConfirm: false,
            layoutOptions: {
              dataLayout: 'singleColumn',
              dense: false,
              layoutOrder: 'row',
              maxVisibleColumns: {
                auto: true,
                maxColumns: 3,
              },
              maxVisibleRows: {
                auto: true,
                maxRows: 3,
              },
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
                cId: 'uid',
                qFieldDefs: ['A'],
                qSortCriterias: [
                  {
                    qSortByState: 1,
                    qSortByLoadOrder: 1,
                    qSortByNumeric: 1,
                    qSortByAscii: 1,
                  },
                ],
              },
            },
          },
        },
      ]);
    });

    test('from dimension object', async () => {
      await h.addDimension({
        qLibraryId: 'piwefh',
      });
      expect(children).toEqual([
        {
          qChildren: [],
          qProperty: {
            qInfo: {
              qType: expect.any(String),
            },
            title: 'lib dim title',
            searchEnabled: true,
            showTitle: true,
            wildCardSearch: false,
            checkboxes: false,
            histogram: false,
            autoConfirm: false,
            layoutOptions: {
              dataLayout: 'singleColumn',
              dense: false,
              layoutOrder: 'row',
              maxVisibleColumns: {
                auto: true,
                maxColumns: 3,
              },
              maxVisibleRows: {
                auto: true,
                maxRows: 3,
              },
            },
            qListObjectDef: {
              qLibraryId: 'piwefh',
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
                cId: 'uid',
                qSortCriterias: [
                  {
                    qSortByState: 1,
                    qSortByLoadOrder: 1,
                    qSortByNumeric: 1,
                    qSortByAscii: 1,
                  },
                ],
              },
            },
          },
        },
      ]);
    });

    test('from listbox object', () => {
      h.addDimension({
        checkboxes: true,
        qListObjectDef: {
          qDef: {
            qFieldDefs: ['C'],
          },
        },
      });
      expect(children).toEqual([
        {
          qChildren: [],
          qProperty: {
            qInfo: {
              qType: expect.any(String),
            },
            title: 'C',
            searchEnabled: true,
            showTitle: true,
            wildCardSearch: false,
            checkboxes: true,
            histogram: false,
            autoConfirm: false,
            layoutOptions: {
              dataLayout: 'singleColumn',
              dense: false,
              layoutOrder: 'row',
              maxVisibleColumns: {
                auto: true,
                maxColumns: 3,
              },
              maxVisibleRows: {
                auto: true,
                maxRows: 3,
              },
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
                cId: 'uid',
                qFieldDefs: ['C'],
                qSortCriterias: [
                  {
                    qSortByState: 1,
                    qSortByLoadOrder: 1,
                    qSortByNumeric: 1,
                    qSortByAscii: 1,
                  },
                ],
              },
            },
          },
        },
      ]);
    });

    test('from listbox object - override title', () => {
      h.addDimension({
        checkboxes: true,
        title: 'My custom title',
        qListObjectDef: {
          qDef: {
            qFieldDefs: ['C'],
          },
        },
      });
      expect(children).toEqual([
        {
          qChildren: [],
          qProperty: {
            qInfo: {
              qType: expect.any(String),
            },
            title: 'My custom title',
            searchEnabled: true,
            showTitle: true,
            wildCardSearch: false,
            checkboxes: true,
            histogram: false,
            autoConfirm: false,
            layoutOptions: {
              dataLayout: 'singleColumn',
              dense: false,
              layoutOrder: 'row',
              maxVisibleColumns: {
                auto: true,
                maxColumns: 3,
              },
              maxVisibleRows: {
                auto: true,
                maxRows: 3,
              },
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
                cId: 'uid',
                qFieldDefs: ['C'],
                qSortCriterias: [
                  {
                    qSortByState: 1,
                    qSortByLoadOrder: 1,
                    qSortByNumeric: 1,
                    qSortByAscii: 1,
                  },
                ],
              },
            },
          },
        },
      ]);
    });
  });
});
