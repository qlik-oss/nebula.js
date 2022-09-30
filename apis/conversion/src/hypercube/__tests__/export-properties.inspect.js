import exportProperties from '../export-properties';
import * as Helpers from '../../helpers';

describe('exportProperties', () => {
  describe('interColumnSortOrder', () => {
    describe('without qLayoutExclude', () => {
      let propertyTree;
      beforeEach(() => {
        propertyTree = {
          qProperty: {
            qHyperCubeDef: {
              qDimensions: [],
              qMeasures: [],
              qInterColumnSortOrder: [],
            },
          },
        };
      });

      test('should have correct qInterColumnSortOrder when qInterColumnSortOrder = undefined', () => {
        propertyTree.qProperty.qHyperCubeDef.qInterColumnSortOrder = undefined;
        const exportFormat = exportProperties({ propertyTree });
        expect(exportFormat.data[0].interColumnSortOrder).toEqual([]);
      });

      test('should have correct qInterColumnSortOrder when qInterColumnSortOrder = []', () => {
        const exportFormat = exportProperties({ propertyTree });
        expect(exportFormat.data[0].interColumnSortOrder).toEqual([]);
      });

      test('should have correct qInterColumnSortOrder when qInterColumnSortOrder is array with values', () => {
        propertyTree.qProperty.qHyperCubeDef.qInterColumnSortOrder = [2, 1, 3];
        const exportFormat = exportProperties({ propertyTree });
        expect(exportFormat.data[0].interColumnSortOrder).toEqual([2, 1, 3]);
      });
    });

    describe('with qLayoutExclude', () => {
      describe('qLayoutExclude.qHyperCubeDef.qInterColumnSortOrder = undefined', () => {
        let propertyTree;
        beforeEach(() => {
          propertyTree = {
            qProperty: {
              qHyperCubeDef: {
                qDimensions: [],
                qMeasures: [],
                qInterColumnSortOrder: [],
                qLayoutExclude: {
                  qHyperCubeDef: {
                    qInterColumnSortOrder: undefined,
                  },
                },
              },
            },
          };
        });

        test('should have correct qInterColumnSortOrder when qInterColumnSortOrder = undefined', () => {
          propertyTree.qProperty.qHyperCubeDef.qInterColumnSortOrder = undefined;
          const exportFormat = exportProperties({ propertyTree });
          expect(exportFormat.data[0].interColumnSortOrder).toEqual([]);
        });

        test('should have correct qInterColumnSortOrder when qInterColumnSortOrder = []', () => {
          const exportFormat = exportProperties({ propertyTree });
          expect(exportFormat.data[0].interColumnSortOrder).toEqual([]);
        });

        test('should have correct qInterColumnSortOrder when qInterColumnSortOrder is array with values', () => {
          propertyTree.qProperty.qHyperCubeDef.qInterColumnSortOrder = [2, 1, 3];
          const exportFormat = exportProperties({ propertyTree });
          expect(exportFormat.data[0].interColumnSortOrder).toEqual([2, 1, 3]);
        });
      });

      describe('qLayoutExclude.qHyperCubeDef.qInterColumnSortOrder = []', () => {
        let propertyTree;
        beforeEach(() => {
          propertyTree = {
            qProperty: {
              qHyperCubeDef: {
                qDimensions: [],
                qMeasures: [],
                qInterColumnSortOrder: [],
                qLayoutExclude: {
                  qHyperCubeDef: {
                    qInterColumnSortOrder: [],
                  },
                },
              },
            },
          };
        });

        test('should have correct qInterColumnSortOrder when qInterColumnSortOrder = undefined', () => {
          propertyTree.qProperty.qHyperCubeDef.qInterColumnSortOrder = undefined;
          const exportFormat = exportProperties({ propertyTree });
          expect(exportFormat.data[0].interColumnSortOrder).toEqual([]);
        });

        test('should have correct qInterColumnSortOrder when qInterColumnSortOrder = []', () => {
          const exportFormat = exportProperties({ propertyTree });
          expect(exportFormat.data[0].interColumnSortOrder).toEqual([]);
        });

        test('should have correct qInterColumnSortOrder when qInterColumnSortOrder is array with values', () => {
          propertyTree.qProperty.qHyperCubeDef.qInterColumnSortOrder = [2, 1, 3];
          const exportFormat = exportProperties({ propertyTree });
          expect(exportFormat.data[0].interColumnSortOrder).toEqual([2, 1, 3]);
        });
      });

      describe('qLayoutExclude.qHyperCubeDef.qInterColumnSortOrder is array with values', () => {
        let propertyTree;
        beforeEach(() => {
          propertyTree = {
            qProperty: {
              qHyperCubeDef: {
                qDimensions: [],
                qMeasures: [],
                qInterColumnSortOrder: [],
                qLayoutExclude: {
                  qHyperCubeDef: {
                    qInterColumnSortOrder: [2, 1, 3, 0],
                  },
                },
              },
            },
          };
        });

        test('should have correct qInterColumnSortOrder when qInterColumnSortOrder = undefined', () => {
          propertyTree.qProperty.qHyperCubeDef.qInterColumnSortOrder = undefined;
          const exportFormat = exportProperties({ propertyTree });
          expect(exportFormat.data[0].interColumnSortOrder).toEqual([]);
        });

        test('should have correct qInterColumnSortOrder when qInterColumnSortOrder = []', () => {
          const exportFormat = exportProperties({ propertyTree });
          expect(exportFormat.data[0].interColumnSortOrder).toEqual([]);
        });

        test('should have correct qInterColumnSortOrder when qInterColumnSortOrder is not an ordered-subset of qLayoutExclude.qHyperCubeDef.qInterColumnSortOrder', () => {
          propertyTree.qProperty.qHyperCubeDef.qInterColumnSortOrder = [1, 0, 2];
          const exportFormat = exportProperties({ propertyTree });
          expect(exportFormat.data[0].interColumnSortOrder).toEqual([1, 0, 2]);
        });

        test('should have correct qInterColumnSortOrder when qInterColumnSortOrder is an ordered-subset of qLayoutExclude.qHyperCubeDef.qInterColumnSortOrder', () => {
          propertyTree.qProperty.qHyperCubeDef.qInterColumnSortOrder = [1, 0];
          const exportFormat = exportProperties({ propertyTree });
          expect(exportFormat.data[0].interColumnSortOrder).toEqual([2, 1, 3, 0]);
        });
      });
    });
  });

  describe('dimensions and measures', () => {
    let propertyTree;
    beforeEach(() => {
      propertyTree = {
        qProperty: {
          qHyperCubeDef: {
            qDimensions: [{ qDef: { qFieldDefs: ['Dim1'] } }, { qDef: { qFieldDefs: ['Dim2'] } }],
            qMeasures: [{ qDef: { qDef: 'Mes1' } }, { qDef: { qDef: 'Mes2' } }],
            qInterColumnSortOrder: [],
          },
        },
      };
    });

    test('should have correct dimensions', () => {
      const exportFormat = exportProperties({ propertyTree });
      expect(exportFormat.data[0].dimensions).toEqual([
        { qDef: { qFieldDefs: ['Dim1'] } },
        { qDef: { qFieldDefs: ['Dim2'] } },
      ]);
    });

    test('should have correct excludedDimensions when qLayoutExclude is undefined', () => {
      const exportFormat = exportProperties({ propertyTree });
      expect(exportFormat.data[0].excludedDimensions).toEqual([]);
    });

    test('should have correct excludedDimensions when qLayoutExclude has dimensions', () => {
      propertyTree.qProperty.qHyperCubeDef.qLayoutExclude = {
        qHyperCubeDef: {
          qDimensions: [{ qDef: { qFieldDefs: ['Dim3'] } }, { qDef: { qFieldDefs: ['Dim4'] } }],
        },
      };
      const exportFormat = exportProperties({ propertyTree });
      expect(exportFormat.data[0].excludedDimensions).toEqual([
        { qDef: { qFieldDefs: ['Dim3'] } },
        { qDef: { qFieldDefs: ['Dim4'] } },
      ]);
      expect(propertyTree.qProperty.qHyperCubeDef.qLayoutExclude).toBe(undefined);
    });

    test('should have correct measures', () => {
      const exportFormat = exportProperties({ propertyTree });
      expect(exportFormat.data[0].measures).toEqual([{ qDef: { qDef: 'Mes1' } }, { qDef: { qDef: 'Mes2' } }]);
    });

    test('should have correct excludedMeasures when qLayoutExclude is undefined', () => {
      const exportFormat = exportProperties({ propertyTree });
      expect(exportFormat.data[0].excludedMeasures).toEqual([]);
    });

    test('should have correct excludedMeasures when qLayoutExclude has measures', () => {
      propertyTree.qProperty.qHyperCubeDef.qLayoutExclude = {
        qHyperCubeDef: {
          qMeasures: [{ qDef: { qDef: 'Mes3' } }, { qDef: { qDef: 'Mes4' } }],
        },
      };
      const exportFormat = exportProperties({ propertyTree });
      expect(exportFormat.data[0].excludedMeasures).toEqual([{ qDef: { qDef: 'Mes3' } }, { qDef: { qDef: 'Mes4' } }]);
      expect(propertyTree.qProperty.qHyperCubeDef.qLayoutExclude).toBe(undefined);
    });
  });

  describe('properties and qHyperCubeDef.qLayoutExclude', () => {
    let propertyTree;
    beforeEach(() => {
      propertyTree = {
        qProperty: {
          qHyperCubeDef: {
            qDimensions: [],
            qMeasures: [],
            qInterColumnSortOrder: [],
            qLayoutExclude: {
              qHyperCubeDef: {
                qInterColumnSortOrder: [2, 1, 3, 0],
              },
            },
          },
          prop1: {
            prop11: {
              prop111: 111,
            },
          },
        },
      };
    });

    test('should be copied to exportFormat', () => {
      const exportFormat = exportProperties({ propertyTree });
      expect(exportFormat.properties.qHyperCubeDef).toEqual({
        qDimensions: [],
        qMeasures: [],
        qInterColumnSortOrder: [],
      });
      expect(exportFormat.properties.prop1).toEqual({
        prop11: {
          prop111: 111,
        },
      });
    });

    test('propertyTree.qProperty.qHyperCubeDef.qLayoutExclude should be deleted', () => {
      exportProperties({ propertyTree });
      expect(propertyTree.qProperty.qHyperCubeDef.qLayoutExclude).toBe(undefined);
    });
  });

  describe('hypercubePath', () => {
    let propertyTree;
    let hypercubePath;
    beforeEach(() => {
      propertyTree = {
        qProperty: {
          boxPlotDef: {
            qHyperCubeDef: {
              qDimensions: [],
              qMeasures: [],
              qInterColumnSortOrder: [],
              qLayoutExclude: {
                qHyperCubeDef: {
                  qInterColumnSortOrder: [2, 1, 3, 0],
                },
              },
            },
          },
          prop1: {
            prop11: {
              prop111: 111,
            },
          },
        },
      };

      hypercubePath = 'boxPlotDef';
    });

    test('should be copied to exportFormat', () => {
      const exportFormat = exportProperties({ propertyTree, hypercubePath });
      expect(exportFormat.properties.qHyperCubeDef).toEqual({
        qDimensions: [],
        qMeasures: [],
        qInterColumnSortOrder: [],
      });
      expect(exportFormat.properties.prop1).toEqual({
        prop11: {
          prop111: 111,
        },
      });
    });

    test('qLayoutExclude should be deleted', () => {
      exportProperties({ propertyTree, hypercubePath });
      expect(propertyTree.qProperty.boxPlotDef.qHyperCubeDef).toBe(undefined);
    });
  });

  describe('properties.qLayoutExclude', () => {
    let propertyTree;
    let restoreChangedPropertiesMock;

    beforeEach(() => {
      propertyTree = {
        qProperty: {
          qHyperCubeDef: {
            qDimensions: [],
            qMeasures: [],
            qInterColumnSortOrder: [],
            qLayoutExclude: {
              qHyperCubeDef: {
                qInterColumnSortOrder: [2, 1, 3, 0],
              },
            },
          },
          qLayoutExclude: {},
          prop1: {
            prop11: {
              prop111: 111,
            },
          },
        },
      };
      restoreChangedPropertiesMock = jest.fn();
      jest.spyOn(Helpers.default, 'restoreChangedProperties').mockImplementation(restoreChangedPropertiesMock);
    });

    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    test('properties.qLayoutExclude should be deleted if there is no quarantine', () => {
      exportProperties({ propertyTree });
      expect(propertyTree.qProperty.qLayoutExclude).toBe(undefined);
    });

    test('properties.qLayoutExclude should be deleted if quarantine is an empty object', () => {
      propertyTree.qProperty.qLayoutExclude.quarantine = {};
      exportProperties({ propertyTree });
      expect(propertyTree.qProperty.qLayoutExclude).toBe(undefined);
    });

    test('properties.qLayoutExclude should be kept if quarantine is an object which is not empty', () => {
      propertyTree.qProperty.qLayoutExclude.quarantine = { prop1: 1 };
      exportProperties({ propertyTree });
      expect(propertyTree.qProperty.qLayoutExclude).toEqual({ quarantine: { prop1: 1 } });
    });

    test('properties.qLayoutExclude.disabled should be copied to exportFormat.properties', () => {
      propertyTree.qProperty.qLayoutExclude.quarantine = { prop3: 3 };
      propertyTree.qProperty.qLayoutExclude.disabled = {
        prop1: {
          prop11: 110,
        },
        prop2: {
          prop21: 21,
        },
      };
      const exportFormat = exportProperties({ propertyTree });
      expect(propertyTree.qProperty.qLayoutExclude.disabled).toBe(undefined);
      expect(exportFormat.properties.prop1).toEqual({ prop11: { prop111: 111 } });
      expect(exportFormat.properties.prop2).toEqual({ prop21: 21 });
    });

    test('helpers.restoreChangedProperties should not be called if there is no properties.qLayoutExclude.changed', () => {
      propertyTree.qProperty.qLayoutExclude.quarantine = { prop3: 3 };
      exportProperties({ propertyTree });
      expect(restoreChangedPropertiesMock).toHaveBeenCalledTimes(0);
    });

    test('helpers.restoreChangedProperties should be called if there is properties.qLayoutExclude.changed', () => {
      propertyTree.qProperty.qLayoutExclude.quarantine = { prop3: 3 };
      propertyTree.qProperty.qLayoutExclude.changed = { prop4: 4 };
      exportProperties({ propertyTree });
      expect(restoreChangedPropertiesMock).toHaveBeenCalledTimes(1);
      expect(propertyTree.qProperty.qLayoutExclude.changed).toBe(undefined);
    });
  });
});
