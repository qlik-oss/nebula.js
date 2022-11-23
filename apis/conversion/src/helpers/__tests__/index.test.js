/* eslint-disable no-param-reassign */
import helpers from '../index';

describe('restoreChangedProperties', () => {
  test('should restore changed properties correctly', () => {
    const properties = {
      prop1: 1,
      prop2: 222,
      qLayoutExclude: {
        changed: {
          prop1: {
            to: 1,
            from: 11,
          },
          prop2: {
            to: 2,
            from: 22,
          },
          prop3: {
            to: 3,
            from: 33,
          },
        },
      },
    };
    helpers.restoreChangedProperties(properties);
    expect(properties).toEqual({
      prop1: 11,
      prop2: 222,
      qLayoutExclude: {
        changed: {
          prop1: {
            to: 1,
            from: 11,
          },
          prop2: {
            to: 2,
            from: 22,
          },
          prop3: {
            to: 3,
            from: 33,
          },
        },
      },
    });
  });
});

describe('isMasterItemProperty', () => {
  test('should return true for qMetaDef', () => {
    expect(helpers.isMasterItemProperty('qMetaDef')).toBe(true);
  });

  test('should return true for descriptionExpression', () => {
    expect(helpers.isMasterItemProperty('descriptionExpression')).toBe(true);
  });

  test('should return true for labelExpression', () => {
    expect(helpers.isMasterItemProperty('labelExpression')).toBe(true);
  });

  test('should return false for everything else', () => {
    expect(helpers.isMasterItemProperty('qMetaDef1')).toBe(false);
    expect(helpers.isMasterItemProperty('descriptionExpression1')).toBe(false);
    expect(helpers.isMasterItemProperty('labelExpression1')).toBe(false);
    expect(helpers.isMasterItemProperty('abc')).toBe(false);
  });
});

describe('importCommonProperties', () => {
  let newProperties;
  let exportFormat;
  let initialProperties;

  describe('visualization', () => {
    beforeEach(() => {
      newProperties = {};
      exportFormat = {};
      initialProperties = {
        visualization: 'some visualization',
      };
    });

    test('should copy visualization correctly', () => {
      helpers.importCommonProperties(newProperties, exportFormat, initialProperties);
      expect(newProperties.visualization).toBe('some visualization');
    });
  });

  describe('qType', () => {
    beforeEach(() => {
      newProperties = {};
      exportFormat = {};
      initialProperties = {
        qInfo: { qType: 'some type' },
      };
    });

    test('should set qType correctly if it is not a master object', () => {
      helpers.importCommonProperties(newProperties, exportFormat, initialProperties);
      expect(newProperties.qInfo.qType).toBe('some type');
    });

    test('should set qType correctly if it is a master object', () => {
      exportFormat.properties = { qInfo: { qType: 'masterobject' } };
      helpers.importCommonProperties(newProperties, exportFormat, initialProperties);
      expect(newProperties.qInfo.qType).toBe('masterobject');
    });
  });
});

describe('copyPropertyIfExist', () => {
  let source;
  let target;

  beforeEach(() => {
    source = {
      prop1: 1,
      prop2: 2,
      prop3: undefined,
    };
    target = {
      prop1: 10,
      prop3: 30,
      prop4: 40,
    };
  });

  it('should copy property if it exists in source to target', () => {
    helpers.copyPropertyIfExist('prop1', source, target);
    helpers.copyPropertyIfExist('prop2', source, target);
    helpers.copyPropertyIfExist('prop3', source, target);
    helpers.copyPropertyIfExist('prop4', source, target);
    helpers.copyPropertyIfExist('prop5', source, target);

    expect(target).toEqual({
      prop1: 1,
      prop2: 2,
      prop3: undefined,
      prop4: 40,
    });
  });
});

describe('copyPropertyOrSetDefault', () => {
  let source;
  let target;

  beforeEach(() => {
    source = {
      prop1: 1,
      prop2: 2,
      prop3: undefined,
    };
    target = {
      prop1: 10,
      prop3: 30,
      prop4: 40,
    };
  });

  test('should copy property if it exists in source to target, otherwise set to default', () => {
    helpers.copyPropertyOrSetDefault('prop1', source, target);
    helpers.copyPropertyOrSetDefault('prop2', source, target);
    helpers.copyPropertyOrSetDefault('prop3', source, target);
    helpers.copyPropertyOrSetDefault('prop4', source, target);
    helpers.copyPropertyOrSetDefault('prop5', source, target);
    helpers.copyPropertyOrSetDefault('prop6', source, target, 60);

    expect(target).toEqual({
      prop1: 1,
      prop2: 2,
      prop3: undefined,
      prop4: undefined,
      prop5: undefined,
      prop6: 60,
    });
  });
});

describe('createDefaultDimension', () => {
  let dimensionDef;
  let dimensionProperties;

  beforeEach(() => {
    dimensionDef = {
      prop1: 1,
      prop2: 2,
    };
    dimensionProperties = {
      prop1: 10,
      prop3: 30,
    };
  });

  test('should add default values if there is no qOtherTotalSpec and othersLabel', () => {
    const def = helpers.createDefaultDimension(dimensionDef, dimensionProperties);

    expect(def).toEqual({
      prop1: 1,
      prop2: 2,
      prop3: 30,
      qOtherTotalSpec: {
        qOtherCounted: { qv: '10' },
        qOtherLimit: { qv: '0' },
      },
      othersLabel: 'Others',
    });
  });

  test('should keep othersLabel', () => {
    dimensionProperties.othersLabel = 'some label';
    const def = helpers.createDefaultDimension(dimensionDef, dimensionProperties);

    expect(def).toEqual({
      prop1: 1,
      prop2: 2,
      prop3: 30,
      qOtherTotalSpec: {
        qOtherCounted: { qv: '10' },
        qOtherLimit: { qv: '0' },
      },
      othersLabel: 'some label',
    });
  });

  test('should keep qOtherCounted', () => {
    dimensionProperties.qOtherTotalSpec = { qOtherCounted: { qv: '20' } };
    const def = helpers.createDefaultDimension(dimensionDef, dimensionProperties);

    expect(def).toEqual({
      prop1: 1,
      prop2: 2,
      prop3: 30,
      qOtherTotalSpec: {
        qOtherCounted: { qv: '20' },
        qOtherLimit: { qv: '0' },
      },
      othersLabel: 'Others',
    });
  });

  test('should keep qOtherLimit', () => {
    dimensionProperties.qOtherTotalSpec = { qOtherLimit: { qv: '30' } };
    const def = helpers.createDefaultDimension(dimensionDef, dimensionProperties);

    expect(def).toEqual({
      prop1: 1,
      prop2: 2,
      prop3: 30,
      qOtherTotalSpec: {
        qOtherCounted: { qv: '10' },
        qOtherLimit: { qv: '30' },
      },
      othersLabel: 'Others',
    });
  });

  test('should keep qOtherCounted, qOtherLimit, and othersLabel', () => {
    dimensionProperties.othersLabel = 'some label';
    dimensionProperties.qOtherTotalSpec = {
      qOtherCounted: { qv: '20' },
      qOtherLimit: { qv: '30' },
    };
    const def = helpers.createDefaultDimension(dimensionDef, dimensionProperties);

    expect(def).toEqual({
      prop1: 1,
      prop2: 2,
      prop3: 30,
      qOtherTotalSpec: {
        qOtherCounted: { qv: '20' },
        qOtherLimit: { qv: '30' },
      },
      othersLabel: 'some label',
    });
  });
});

describe('createDefaultMeasure', () => {
  let measureDef;
  let measureProperties;

  beforeEach(() => {
    measureDef = {
      prop1: 1,
      prop2: 2,
    };
    measureProperties = {
      prop1: 10,
      prop3: 30,
    };
  });

  test('should create default measure correctly', () => {
    const def = helpers.createDefaultMeasure(measureDef, measureProperties);

    expect(def).toEqual({
      prop1: 1,
      prop2: 2,
      prop3: 30,
    });
  });
});

describe('resolveValue', () => {
  let data;
  let input;

  beforeEach(() => {
    data = (a) => a * 2;
    input = 5;
  });

  test('should resolve value correctly if data is a function', () => {
    expect(helpers.resolveValue(data, input)).toBe(10);
    expect(helpers.resolveValue(data, input, 100)).toBe(10);
  });

  test('should resolve value correctly if data is a number', () => {
    data = 20;
    expect(helpers.resolveValue(data, input)).toBe(20);
    expect(helpers.resolveValue(data, input, 100)).toBe(20);
  });

  test('should resolve value correctly if data is not a function or not a number', () => {
    expect(helpers.resolveValue(NaN, input)).toBe(undefined);
    expect(helpers.resolveValue(NaN, input, 100)).toBe(100);
    expect(helpers.resolveValue('a', input)).toBe(undefined);
    expect(helpers.resolveValue('a', input, 100)).toBe(100);
  });
});

describe('getHypercubePath', () => {
  let qae;

  beforeEach(() => {
    qae = {
      data: { targets: [{ propertyPath: '/qHyperCubeDef' }] },
    };
  });

  test('should return to empty string if propertyPath = "/qHyperCubeDef"', () => {
    expect(helpers.getHypercubePath(qae)).toBe('');
  });

  test('should return to the part before /qHyperCubeDef', () => {
    qae.data.targets[0].propertyPath = 'boxPlotDef/qHyperCubeDef';
    expect(helpers.getHypercubePath(qae)).toBe('boxPlotDef');
  });

  test('should return to the part before /qHyperCubeDef and replace / by .', () => {
    qae.data.targets[0].propertyPath = 'boxPlotDef/point/qHyperCubeDef';
    expect(helpers.getHypercubePath(qae)).toBe('boxPlotDef.point');
  });
});

describe('getDefaultDimension', () => {
  test('should return correct default dimension', () => {
    expect(helpers.getDefaultDimension()).toEqual({
      qDef: {
        autoSort: true,
        cId: '',
        othersLabel: 'Others',
      },
      qLibraryId: '',
      qNullSuppression: false,
      qOtherLabel: 'Others',
      qOtherTotalSpec: {
        qOtherLimitMode: 'OTHER_GE_LIMIT',
        qOtherMode: 'OTHER_OFF',
        qOtherSortMode: 'OTHER_SORT_DESCENDING',
        qSuppressOther: false,
      },
    });
  });
});

describe('getDefaultMeasure', () => {
  test('should return correct default measure', () => {
    expect(helpers.getDefaultMeasure()).toEqual({
      qDef: {
        autoSort: true,
        cId: '',
        numFormatFromTemplate: true,
      },
      qLibraryId: '',
      qTrendLines: [],
    });
  });
});

describe('setInterColumnSortOrder', () => {
  let exportFormat;
  let newHyperCubeDef;

  beforeEach(() => {
    exportFormat = {
      data: [
        {
          interColumnSortOrder: [1, 0, 2],
        },
      ],
    };
    newHyperCubeDef = {
      qDimensions: [{}],
      qMeasures: [{}, {}],
    };
  });

  test('should set correct qInterColumnSortOrder when its size match the number of dimensions and measures', () => {
    helpers.setInterColumnSortOrder({ exportFormat, newHyperCubeDef });

    expect(newHyperCubeDef).toEqual({
      qDimensions: [{}],
      qMeasures: [{}, {}],
      qInterColumnSortOrder: [1, 0, 2],
    });
  });

  test('should set correct qInterColumnSortOrder when its size is bigger than the number of dimensions and measures', () => {
    exportFormat.data[0].interColumnSortOrder = [0, 3, 2, 1];
    helpers.setInterColumnSortOrder({ exportFormat, newHyperCubeDef });

    expect(newHyperCubeDef).toEqual({
      qDimensions: [{}],
      qMeasures: [{}, {}],
      qInterColumnSortOrder: [0, 2, 1],
    });
  });

  test('should set correct qInterColumnSortOrder when its size is smaller than the number of dimensions and measures', () => {
    exportFormat.data[0].interColumnSortOrder = [0, 1];
    helpers.setInterColumnSortOrder({ exportFormat, newHyperCubeDef });

    expect(newHyperCubeDef).toEqual({
      qDimensions: [{}],
      qMeasures: [{}, {}],
      qInterColumnSortOrder: [0, 1, 2],
    });
  });

  test('should set correct qInterColumnSortOrder when its size is smaller than the number of dimensions and measures, and the interColumnSortOrder is not sorted', () => {
    exportFormat.data[0].interColumnSortOrder = [0, 2, 1];
    newHyperCubeDef.qMeasures = [{}, {}, {}];
    helpers.setInterColumnSortOrder({ exportFormat, newHyperCubeDef });

    expect(newHyperCubeDef).toEqual({
      qDimensions: [{}],
      qMeasures: [{}, {}, {}],
      qInterColumnSortOrder: [0, 2, 1, 3],
    });
  });
});

describe('createNewProperties', () => {
  let exportFormat;
  let initialProperties;

  describe('No hypercubePath', () => {
    describe('No exportFormat.properties', () => {
      describe('No initialProperties', () => {
        beforeEach(() => {
          exportFormat = {
            properties: {},
          };
          initialProperties = {};
        });

        test('should return correct outcome', () => {
          const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

          expect(newProperties).toEqual({
            qLayoutExclude: { disabled: {}, quarantine: {} },
          });
        });
      });

      describe('Have initialProperties', () => {
        beforeEach(() => {
          exportFormat = {
            properties: {},
          };
          initialProperties = {
            prop1: 1,
          };
        });

        test('should return correct outcome if initialProperties have no components', () => {
          const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

          expect(newProperties).toEqual({
            qLayoutExclude: { disabled: {}, quarantine: {} },
            prop1: 1,
          });
        });

        test('should return correct outcome if initialProperties have components', () => {
          initialProperties.components = [1, 2];
          const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

          expect(newProperties).toEqual({
            qLayoutExclude: { disabled: {}, quarantine: {} },
            prop1: 1,
            components: [1, 2],
          });
        });

        test('should return correct outcome if initialProperties have components as null', () => {
          initialProperties.components = null;
          const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

          expect(newProperties).toEqual({
            qLayoutExclude: { disabled: {}, quarantine: {} },
            prop1: 1,
            components: [],
          });
        });
      });
    });

    describe('Have exportFormat.properties', () => {
      describe('No initialProperties', () => {
        describe('qLayoutExclude', () => {
          beforeEach(() => {
            exportFormat = {
              properties: {
                qLayoutExclude: {
                  prop1: 1,
                },
              },
            };
            initialProperties = {};
          });

          test('should return correct outcome if there is no qLayoutExclude.quarantine', () => {
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).toEqual({
              qLayoutExclude: { disabled: {}, quarantine: {} },
            });
          });

          test('should return correct outcome if there is qLayoutExclude.quarantine', () => {
            exportFormat.properties.qLayoutExclude.quarantine = { prop2: 2, prop3: 3 };
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).toEqual({
              qLayoutExclude: { disabled: {}, quarantine: { prop2: 2, prop3: 3 } },
            });
          });
        });

        describe('qHyperCubeDef', () => {
          beforeEach(() => {
            exportFormat = {
              properties: {
                qHyperCubeDef: {
                  prop1: 1,
                },
              },
            };
            initialProperties = {};
          });

          test('should return correct outcome', () => {
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).toEqual({
              qLayoutExclude: {
                disabled: {
                  qHyperCubeDef: {
                    prop1: 1,
                  },
                },
                quarantine: {},
              },
            });
          });
        });

        describe('master item propperty', () => {
          beforeEach(() => {
            exportFormat = {
              properties: {
                qMetaDef: {
                  prop1: 1,
                },
                descriptionExpression: {
                  prop2: 2,
                },
                labelExpression: {
                  prop3: 3,
                },
              },
            };
            initialProperties = {};
          });

          test('should return correct outcome', () => {
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).toEqual({
              qLayoutExclude: {
                disabled: {},
                quarantine: {},
              },
              qMetaDef: {
                prop1: 1,
              },
              descriptionExpression: {
                prop2: 2,
              },
              labelExpression: {
                prop3: 3,
              },
            });
          });
        });

        describe('other propperties', () => {
          beforeEach(() => {
            exportFormat = {
              properties: {
                prop1: {
                  prop11: 11,
                },
              },
            };
            initialProperties = {};
          });

          test('should return correct outcome', () => {
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).toEqual({
              qLayoutExclude: {
                disabled: {
                  prop1: {
                    prop11: 11,
                  },
                },
                quarantine: {},
              },
            });
          });
        });
      });

      describe('Have initialProperties', () => {
        describe('qLayoutExclude', () => {
          beforeEach(() => {
            exportFormat = {
              properties: {
                qLayoutExclude: {
                  prop1: 1,
                },
              },
            };
            initialProperties = {
              prop100: 100,
            };
          });

          test('should return correct outcome if there is no qLayoutExclude.quarantine', () => {
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).toEqual({
              qLayoutExclude: { disabled: {}, quarantine: {} },
              prop100: 100,
            });
          });

          test('should return correct outcome if there is qLayoutExclude.quarantine', () => {
            exportFormat.properties.qLayoutExclude.quarantine = { prop2: 2, prop3: 3 };
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).toEqual({
              qLayoutExclude: { disabled: {}, quarantine: { prop2: 2, prop3: 3 } },
              prop100: 100,
            });
          });
        });

        describe('qHyperCubeDef', () => {
          beforeEach(() => {
            exportFormat = {
              properties: {
                qHyperCubeDef: {
                  prop1: 1,
                },
              },
            };
            initialProperties = {
              prop100: 100,
            };
          });

          test('should return correct outcome if there is no initialProperties.qHyperCubeDef', () => {
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).toEqual({
              qLayoutExclude: {
                disabled: {
                  qHyperCubeDef: {
                    prop1: 1,
                  },
                },
                quarantine: {},
              },
              prop100: 100,
            });
          });

          test('should return correct outcome if there is initialProperties.qHyperCubeDef', () => {
            initialProperties.qHyperCubeDef = { prop1: 10, prop2: 20 };
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).toEqual({
              qLayoutExclude: {
                disabled: {},
                quarantine: {},
              },
              qHyperCubeDef: {
                prop1: 1,
                prop2: 20,
              },
              prop100: 100,
            });
          });
        });

        describe('master item propperty', () => {
          beforeEach(() => {
            exportFormat = {
              properties: {
                qMetaDef: {
                  prop1: 1,
                },
                descriptionExpression: {
                  prop2: 2,
                },
                labelExpression: {
                  prop3: 3,
                },
              },
            };
            initialProperties = {
              prop100: 100,
            };
          });

          test('should return correct outcome', () => {
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).toEqual({
              qLayoutExclude: {
                disabled: {},
                quarantine: {},
              },
              qMetaDef: {
                prop1: 1,
              },
              descriptionExpression: {
                prop2: 2,
              },
              labelExpression: {
                prop3: 3,
              },
              prop100: 100,
            });
          });
        });

        describe('other propperties', () => {
          beforeEach(() => {
            exportFormat = {
              properties: {
                prop1: {
                  prop11: 11,
                },
                prop2: {
                  prop21: 11,
                },
              },
            };
            initialProperties = {
              prop1: 1,
              prop3: 3,
            };
          });

          test('should return correct outcome', () => {
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).toEqual({
              qLayoutExclude: {
                disabled: {
                  prop2: {
                    prop21: 11,
                  },
                },
                quarantine: {},
              },
              prop1: {
                prop11: 11,
              },
              prop3: 3,
            });
          });
        });
      });
    });
  });

  describe('Have 1-step hypercubePath', () => {
    let hypercubePath;
    describe('qHyperCubeDef', () => {
      beforeEach(() => {
        exportFormat = {
          properties: {
            qHyperCubeDef: {
              prop1: 1,
            },
          },
        };
        initialProperties = {};
        hypercubePath = 'boxplotDef';
      });

      test('should return correct outcome if there is no initialProperties.qHyperCubeDef', () => {
        const newProperties = helpers.createNewProperties({ exportFormat, initialProperties, hypercubePath });

        expect(newProperties).toEqual({
          qLayoutExclude: {
            disabled: {},
            quarantine: {},
          },
          boxplotDef: {
            qHyperCubeDef: {
              prop1: 1,
            },
          },
        });
      });

      test('should return correct outcome if there is initialProperties.qHyperCubeDef', () => {
        initialProperties.qHyperCubeDef = { prop1: 10, prop2: 20 };
        const newProperties = helpers.createNewProperties({ exportFormat, initialProperties, hypercubePath });

        expect(newProperties).toEqual({
          qLayoutExclude: {
            disabled: {},
            quarantine: {},
          },
          qHyperCubeDef: {
            prop1: 10,
            prop2: 20,
          },
          boxplotDef: {
            qHyperCubeDef: {
              prop1: 1,
            },
          },
        });
      });
    });
  });

  describe('Have 2-step hypercubePath', () => {
    let hypercubePath;
    describe('qHyperCubeDef', () => {
      beforeEach(() => {
        exportFormat = {
          properties: {
            qHyperCubeDef: {
              prop1: 1,
            },
          },
        };
        initialProperties = {};
        hypercubePath = 'somePath.boxplotDef';
      });

      test('should return correct outcome if there is no initialProperties.qHyperCubeDef', () => {
        const newProperties = helpers.createNewProperties({ exportFormat, initialProperties, hypercubePath });

        expect(newProperties).toEqual({
          qLayoutExclude: {
            disabled: {},
            quarantine: {},
          },
          somePath: {
            boxplotDef: {
              qHyperCubeDef: {
                prop1: 1,
              },
            },
          },
        });
      });

      test('should return correct outcome if there is initialProperties.qHyperCubeDef', () => {
        initialProperties.qHyperCubeDef = { prop1: 10, prop2: 20 };
        const newProperties = helpers.createNewProperties({ exportFormat, initialProperties, hypercubePath });

        expect(newProperties).toEqual({
          qLayoutExclude: {
            disabled: {},
            quarantine: {},
          },
          qHyperCubeDef: {
            prop1: 10,
            prop2: 20,
          },
          somePath: {
            boxplotDef: {
              qHyperCubeDef: {
                prop1: 1,
              },
            },
          },
        });
      });
    });
  });
});

describe('getMaxMinDimensionMeasure', () => {
  let exportFormat;
  let dataDefinition;

  beforeEach(() => {
    exportFormat = {
      data: [
        {
          dimensions: [],
        },
      ],
    };
    dataDefinition = {};
  });

  test('should return correct values if there is no dataDefinition', () => {
    const result = helpers.getMaxMinDimensionMeasure({ exportFormat, dataDefinition });

    expect(result).toEqual({
      maxDimensions: 0,
      minDimensions: 0,
      maxMeasures: 0,
      minMeasures: 0,
    });
  });

  test('should return correct values if there is max, min are numbers', () => {
    dataDefinition = {
      dimensions: { max: 2, min: 1 },
      measures: { max: 10, min: 0 },
    };
    const result = helpers.getMaxMinDimensionMeasure({ exportFormat, dataDefinition });

    expect(result).toEqual({
      maxDimensions: 2,
      minDimensions: 1,
      maxMeasures: 10,
      minMeasures: 0,
    });
  });

  test('should return correct values if there is max, min are functions without parameter', () => {
    dataDefinition = {
      dimensions: { max: () => 2, min: () => 1 },
      measures: { max: () => 10, min: () => 0 },
    };
    const result = helpers.getMaxMinDimensionMeasure({ exportFormat, dataDefinition });

    expect(result).toEqual({
      maxDimensions: 2,
      minDimensions: 1,
      maxMeasures: 10,
      minMeasures: 0,
    });
  });

  test('should return correct values if there is max, min are functions with parameter', () => {
    dataDefinition = {
      dimensions: { max: (x) => x + 4, min: (x) => x + 2 },
      measures: { max: (x) => x + 3, min: (x) => x + 1 },
    };
    exportFormat.data[0].dimensions.length = 2;
    const result = helpers.getMaxMinDimensionMeasure({ exportFormat, dataDefinition });

    expect(result).toEqual({
      maxDimensions: 9,
      minDimensions: 5,
      maxMeasures: 5,
      minMeasures: 3,
    });
  });
});

describe('shouldInitLayoutExclude', () => {
  let exportFormat;
  let maxDimensions;
  let minDimensions;
  let maxMeasures;
  let minMeasures;

  beforeEach(() => {
    exportFormat = {
      data: [
        {
          dimensions: [],
          measures: [],
          excludedDimensions: [],
          excludedMeasures: [],
        },
      ],
    };
    maxDimensions = 0;
    minDimensions = 0;
    maxMeasures = 0;
    minMeasures = 0;
  });

  describe('maxDimensions = 0', () => {
    beforeEach(() => {
      maxDimensions = 0;
    });

    test('should return false if dimensions.length = 0', () => {
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(false);
    });

    test('should return true if dimensions.length > 0', () => {
      exportFormat.data[0].dimensions.length = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(true);
    });
  });

  describe('maxDimensions > 0', () => {
    beforeEach(() => {
      maxDimensions = 3;
    });

    test('should return false if dimensions.length < maxDimensions', () => {
      exportFormat.data[0].dimensions.length = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(false);
    });

    test('should return false if dimensions.length = maxDimensions', () => {
      exportFormat.data[0].dimensions.length = 3;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(false);
    });

    test('should return false if dimensions.length > maxDimensions', () => {
      exportFormat.data[0].dimensions.length = 4;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(true);
    });
  });

  describe('maxMeasures = 0', () => {
    beforeEach(() => {
      maxMeasures = 0;
    });

    test('should return false if measures.length = 0', () => {
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(false);
    });

    test('should return true if measures.length > 0', () => {
      exportFormat.data[0].measures.length = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(true);
    });
  });

  describe('maxMeasures > 0', () => {
    beforeEach(() => {
      maxMeasures = 3;
    });

    test('should return false if measures.length < maxMeasures', () => {
      exportFormat.data[0].measures.length = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(false);
    });

    test('should return false if measures.length = maxMeasures', () => {
      exportFormat.data[0].measures.length = 3;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(false);
    });

    test('should return false if measures.length > maxMeasures', () => {
      exportFormat.data[0].measures.length = 4;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(true);
    });
  });

  describe('dimensions.length <= maxDimensions and excludedDimensions.length = 0', () => {
    beforeEach(() => {
      maxDimensions = 4;
      minDimensions = 2;
      exportFormat.data[0].excludedDimensions.length = 0;
    });

    test('should return false if dimensions.length < minDimensions', () => {
      exportFormat.data[0].dimensions.length = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(false);
    });

    test('should return false if dimensions.length = minDimensions', () => {
      exportFormat.data[0].dimensions.length = 2;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(false);
    });

    test('should return false if dimensions.length > minDimensions', () => {
      exportFormat.data[0].dimensions.length = 3;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(false);
    });

    test('should return false if dimensions.length = maxDimensions and > minDimensions', () => {
      exportFormat.data[0].dimensions.length = 4;
      minDimensions = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(false);
    });
  });

  describe('dimensions.length <= maxDimensions and excludedDimensions.length > 0', () => {
    beforeEach(() => {
      maxDimensions = 5;
      minDimensions = 3;
      exportFormat.data[0].excludedDimensions.length = 1;
    });

    test('should return false if dimensions.length + excludedDimensions.length < minDimensions', () => {
      exportFormat.data[0].dimensions.length = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(false);
    });

    test('should return false if dimensions.length + excludedDimensions.length = minDimensions', () => {
      exportFormat.data[0].dimensions.length = 2;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(false);
    });

    test('should return false if dimensions.length + excludedDimensions.length > minDimensions', () => {
      exportFormat.data[0].dimensions.length = 3;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(true);
    });

    test('should return false if dimensions.length = maxDimensions and > minDimensions', () => {
      exportFormat.data[0].dimensions.length = 5;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(true);
    });
  });

  describe('measures.length <= maxMeasures and excludedMeasures.length = 0', () => {
    beforeEach(() => {
      maxMeasures = 4;
      minMeasures = 2;
      exportFormat.data[0].excludedMeasures.length = 0;
    });

    test('should return false if measures.length < minMeasures', () => {
      exportFormat.data[0].measures.length = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(false);
    });

    test('should return false if measures.length = minMeasures', () => {
      exportFormat.data[0].measures.length = 2;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(false);
    });

    test('should return false if measures.length > minMeasures', () => {
      exportFormat.data[0].measures.length = 3;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(false);
    });

    test('should return false if measures.length = maxMeasures and > minMeasures', () => {
      exportFormat.data[0].measures.length = 4;
      minMeasures = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(false);
    });
  });

  describe('measures.length <= maxMeasures and excludedMeasures.length > 0', () => {
    beforeEach(() => {
      maxMeasures = 5;
      minMeasures = 3;
      exportFormat.data[0].excludedMeasures.length = 1;
    });

    test('should return false if measures.length + excludedMeasures.length < minMeasures', () => {
      exportFormat.data[0].measures.length = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(false);
    });

    test('should return false if measures.length + excludedMeasures.length = minMeasures', () => {
      exportFormat.data[0].measures.length = 2;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(false);
    });

    test('should return false if measures.length + excludedMeasures.length > minMeasures', () => {
      exportFormat.data[0].measures.length = 3;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(true);
    });

    test('should return false if measures.length = maxMeasures and > minMeasures', () => {
      exportFormat.data[0].measures.length = 5;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).toBe(true);
    });
  });
});

describe('updateDimensionsOnAdded', () => {
  let newProperties;
  let dataDefinition;
  let added;
  beforeEach(() => {
    newProperties = {
      qHyperCubeDef: {
        qDimensions: [
          {
            qDef: {},
          },
          {
            qDef: {},
          },
        ],
      },
    };
    added = ({ qDef }, properties) => {
      qDef.xyz = properties.qHyperCubeDef.qDimensions.length * 10;
    };
    dataDefinition = { dimensions: { added } };
  });

  test('should update dimensions correctly if there is added function', () => {
    helpers.updateDimensionsOnAdded({ newProperties, dataDefinition });
    expect(newProperties.qHyperCubeDef.qDimensions).toEqual([
      {
        qDef: { xyz: 10 },
      },
      {
        qDef: { xyz: 20 },
      },
    ]);
  });

  test('should do nothing if there is no added function', () => {
    dataDefinition.dimensions.added = undefined;
    helpers.updateDimensionsOnAdded({ newProperties, dataDefinition });
    expect(newProperties.qHyperCubeDef.qDimensions).toEqual([
      {
        qDef: {},
      },
      {
        qDef: {},
      },
    ]);
  });
});

describe('updateMeasuresOnAdded', () => {
  let newProperties;
  let dataDefinition;
  let added;
  beforeEach(() => {
    newProperties = {
      qHyperCubeDef: {
        qMeasures: [
          {
            qDef: {},
          },
          {
            qDef: {},
          },
        ],
      },
    };
    added = ({ qDef }, properties) => {
      qDef.xyz = properties.qHyperCubeDef.qMeasures.length * 10;
    };
    dataDefinition = { measures: { added } };
  });

  test('should update measures correctly if there is added function', () => {
    helpers.updateMeasuresOnAdded({ newProperties, dataDefinition });
    expect(newProperties.qHyperCubeDef.qMeasures).toEqual([
      {
        qDef: { xyz: 10 },
      },
      {
        qDef: { xyz: 20 },
      },
    ]);
  });

  test('should do nothing if there is no added function', () => {
    dataDefinition.measures.added = undefined;
    helpers.updateMeasuresOnAdded({ newProperties, dataDefinition });
    expect(newProperties.qHyperCubeDef.qMeasures).toEqual([
      {
        qDef: {},
      },
      {
        qDef: {},
      },
    ]);
  });
});
