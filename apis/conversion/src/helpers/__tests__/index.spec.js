import helpers from '../index';

describe('restoreChangedProperties', () => {
  it('should restore changed properties correctly', async () => {
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
    expect(properties).to.deep.equal({
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

describe('isMasterItemPropperty', () => {
  it('should return true for qMetaDef', () => {
    expect(helpers.isMasterItemPropperty('qMetaDef')).to.equal(true);
  });

  it('should return true for descriptionExpression', () => {
    expect(helpers.isMasterItemPropperty('descriptionExpression')).to.equal(true);
  });

  it('should return true for labelExpression', () => {
    expect(helpers.isMasterItemPropperty('labelExpression')).to.equal(true);
  });

  it('should return false for everything else', () => {
    expect(helpers.isMasterItemPropperty('qMetaDef1')).to.equal(false);
    expect(helpers.isMasterItemPropperty('descriptionExpression1')).to.equal(false);
    expect(helpers.isMasterItemPropperty('labelExpression1')).to.equal(false);
    expect(helpers.isMasterItemPropperty('abc')).to.equal(false);
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

    it('should copy visualization correctly', () => {
      helpers.importCommonProperties(newProperties, exportFormat, initialProperties);
      expect(newProperties.visualization).to.equal('some visualization');
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

    it('should set qType correctly if it is not a master object', () => {
      helpers.importCommonProperties(newProperties, exportFormat, initialProperties);
      expect(newProperties.qInfo.qType).to.equal('some type');
    });

    it('should set qType correctly if it is a master object', () => {
      exportFormat.properties = { qInfo: { qType: 'masterobject' } };
      helpers.importCommonProperties(newProperties, exportFormat, initialProperties);
      expect(newProperties.qInfo.qType).to.equal('masterobject');
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

    expect(target).to.deep.equal({
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

  it('should copy property if it exists in source to target, otherwise set to default', () => {
    helpers.copyPropertyOrSetDefault('prop1', source, target);
    helpers.copyPropertyOrSetDefault('prop2', source, target);
    helpers.copyPropertyOrSetDefault('prop3', source, target);
    helpers.copyPropertyOrSetDefault('prop4', source, target);
    helpers.copyPropertyOrSetDefault('prop5', source, target);
    helpers.copyPropertyOrSetDefault('prop6', source, target, 60);

    expect(target).to.deep.equal({
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

  it('should add default values if there is no qOtherTotalSpec and othersLabel', () => {
    const def = helpers.createDefaultDimension(dimensionDef, dimensionProperties);

    expect(def).to.deep.equal({
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

  it('should keep othersLabel', () => {
    dimensionProperties.othersLabel = 'some label';
    const def = helpers.createDefaultDimension(dimensionDef, dimensionProperties);

    expect(def).to.deep.equal({
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

  it('should keep qOtherCounted', () => {
    dimensionProperties.qOtherTotalSpec = { qOtherCounted: { qv: '20' } };
    const def = helpers.createDefaultDimension(dimensionDef, dimensionProperties);

    expect(def).to.deep.equal({
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

  it('should keep qOtherLimit', () => {
    dimensionProperties.qOtherTotalSpec = { qOtherLimit: { qv: '30' } };
    const def = helpers.createDefaultDimension(dimensionDef, dimensionProperties);

    expect(def).to.deep.equal({
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

  it('should keep qOtherCounted, qOtherLimit, and othersLabel', () => {
    dimensionProperties.othersLabel = 'some label';
    dimensionProperties.qOtherTotalSpec = {
      qOtherCounted: { qv: '20' },
      qOtherLimit: { qv: '30' },
    };
    const def = helpers.createDefaultDimension(dimensionDef, dimensionProperties);

    expect(def).to.deep.equal({
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

  it('should create default measure correctly', () => {
    const def = helpers.createDefaultMeasure(measureDef, measureProperties);

    expect(def).to.deep.equal({
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

  it('should resolve value correctly if data is a function', () => {
    expect(helpers.resolveValue(data, input)).to.equal(10);
    expect(helpers.resolveValue(data, input, 100)).to.equal(10);
  });

  it('should resolve value correctly if data is a number', () => {
    data = 20;
    expect(helpers.resolveValue(data, input)).to.equal(20);
    expect(helpers.resolveValue(data, input, 100)).to.equal(20);
  });

  it('should resolve value correctly if data is not a function or not a number', () => {
    expect(helpers.resolveValue(NaN, input)).to.equal(undefined);
    expect(helpers.resolveValue(NaN, input, 100)).to.equal(100);
    expect(helpers.resolveValue('a', input)).to.equal(undefined);
    expect(helpers.resolveValue('a', input, 100)).to.equal(100);
  });
});

describe('getHypercubePath', () => {
  let qae;

  beforeEach(() => {
    qae = {
      data: { targets: [{ propertyPath: '/qHyperCubeDef' }] },
    };
  });

  it('should return to empty string if propertyPath = "/qHyperCubeDef"', () => {
    expect(helpers.getHypercubePath(qae)).to.equal('');
  });

  it('should return to the part before /qHyperCubeDef', () => {
    qae.data.targets[0].propertyPath = 'boxPlotDef/qHyperCubeDef';
    expect(helpers.getHypercubePath(qae)).to.equal('boxPlotDef');
  });

  it('should return to the part before /qHyperCubeDef and replace / by .', () => {
    qae.data.targets[0].propertyPath = 'boxPlotDef/point/qHyperCubeDef';
    expect(helpers.getHypercubePath(qae)).to.equal('boxPlotDef.point');
  });
});

describe('getDefaultDimension', () => {
  it('should return correct default dimension', () => {
    expect(helpers.getDefaultDimension()).to.deep.equal({
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
  it('should return correct default measure', () => {
    expect(helpers.getDefaultMeasure()).to.deep.equal({
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

  it('should set correct qInterColumnSortOrder when its size match the number of dimensions and measures', () => {
    helpers.setInterColumnSortOrder({ exportFormat, newHyperCubeDef });

    expect(newHyperCubeDef).to.deep.equal({
      qDimensions: [{}],
      qMeasures: [{}, {}],
      qInterColumnSortOrder: [1, 0, 2],
    });
  });

  it('should set correct qInterColumnSortOrder when its size is bigger than the number of dimensions and measures', () => {
    exportFormat.data[0].interColumnSortOrder = [0, 3, 2, 1];
    helpers.setInterColumnSortOrder({ exportFormat, newHyperCubeDef });

    expect(newHyperCubeDef).to.deep.equal({
      qDimensions: [{}],
      qMeasures: [{}, {}],
      qInterColumnSortOrder: [0, 2, 1],
    });
  });

  it('should set correct qInterColumnSortOrder when its size is smaller than the number of dimensions and measures', () => {
    exportFormat.data[0].interColumnSortOrder = [0, 1];
    helpers.setInterColumnSortOrder({ exportFormat, newHyperCubeDef });

    expect(newHyperCubeDef).to.deep.equal({
      qDimensions: [{}],
      qMeasures: [{}, {}],
      qInterColumnSortOrder: [0, 1, 2],
    });
  });

  it('should set correct qInterColumnSortOrder when its size is smaller than the number of dimensions and measures, and the interColumnSortOrder is not sorted', () => {
    exportFormat.data[0].interColumnSortOrder = [0, 2, 1];
    newHyperCubeDef.qMeasures = [{}, {}, {}];
    helpers.setInterColumnSortOrder({ exportFormat, newHyperCubeDef });

    expect(newHyperCubeDef).to.deep.equal({
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

        it('should return correct outcome', () => {
          const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

          expect(newProperties).to.deep.equal({
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

        it('should return correct outcome if initialProperties have no components', () => {
          const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

          expect(newProperties).to.deep.equal({
            qLayoutExclude: { disabled: {}, quarantine: {} },
            prop1: 1,
          });
        });

        it('should return correct outcome if initialProperties have components', () => {
          initialProperties.components = [1, 2];
          const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

          expect(newProperties).to.deep.equal({
            qLayoutExclude: { disabled: {}, quarantine: {} },
            prop1: 1,
            components: [1, 2],
          });
        });

        it('should return correct outcome if initialProperties have components as null', () => {
          initialProperties.components = null;
          const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

          expect(newProperties).to.deep.equal({
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

          it('should return correct outcome if there is no qLayoutExclude.quarantine', () => {
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).to.deep.equal({
              qLayoutExclude: { disabled: {}, quarantine: {} },
            });
          });

          it('should return correct outcome if there is qLayoutExclude.quarantine', () => {
            exportFormat.properties.qLayoutExclude.quarantine = { prop2: 2, prop3: 3 };
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).to.deep.equal({
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

          it('should return correct outcome', () => {
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).to.deep.equal({
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

          it('should return correct outcome', () => {
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).to.deep.equal({
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

          it('should return correct outcome', () => {
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).to.deep.equal({
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

          it('should return correct outcome if there is no qLayoutExclude.quarantine', () => {
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).to.deep.equal({
              qLayoutExclude: { disabled: {}, quarantine: {} },
              prop100: 100,
            });
          });

          it('should return correct outcome if there is qLayoutExclude.quarantine', () => {
            exportFormat.properties.qLayoutExclude.quarantine = { prop2: 2, prop3: 3 };
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).to.deep.equal({
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

          it('should return correct outcome if there is no initialProperties.qHyperCubeDef', () => {
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).to.deep.equal({
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

          it('should return correct outcome if there is initialProperties.qHyperCubeDef', () => {
            initialProperties.qHyperCubeDef = { prop1: 10, prop2: 20 };
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).to.deep.equal({
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

          it('should return correct outcome', () => {
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).to.deep.equal({
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

          it('should return correct outcome', () => {
            const newProperties = helpers.createNewProperties({ exportFormat, initialProperties });

            expect(newProperties).to.deep.equal({
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

      it('should return correct outcome if there is no initialProperties.qHyperCubeDef', () => {
        const newProperties = helpers.createNewProperties({ exportFormat, initialProperties, hypercubePath });

        expect(newProperties).to.deep.equal({
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

      it('should return correct outcome if there is initialProperties.qHyperCubeDef', () => {
        initialProperties.qHyperCubeDef = { prop1: 10, prop2: 20 };
        const newProperties = helpers.createNewProperties({ exportFormat, initialProperties, hypercubePath });

        expect(newProperties).to.deep.equal({
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

      it('should return correct outcome if there is no initialProperties.qHyperCubeDef', () => {
        const newProperties = helpers.createNewProperties({ exportFormat, initialProperties, hypercubePath });

        expect(newProperties).to.deep.equal({
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

      it('should return correct outcome if there is initialProperties.qHyperCubeDef', () => {
        initialProperties.qHyperCubeDef = { prop1: 10, prop2: 20 };
        const newProperties = helpers.createNewProperties({ exportFormat, initialProperties, hypercubePath });

        expect(newProperties).to.deep.equal({
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

  it('should return correct values if there is no dataDefinition', () => {
    const result = helpers.getMaxMinDimensionMeasure({ exportFormat, dataDefinition });

    expect(result).to.deep.equal({
      maxDimensions: 0,
      minDimensions: 0,
      maxMeasures: 0,
      minMeasures: 0,
    });
  });

  it('should return correct values if there is max, min are numbers', () => {
    dataDefinition = {
      dimensions: { max: 2, min: 1 },
      measures: { max: 10, min: 0 },
    };
    const result = helpers.getMaxMinDimensionMeasure({ exportFormat, dataDefinition });

    expect(result).to.deep.equal({
      maxDimensions: 2,
      minDimensions: 1,
      maxMeasures: 10,
      minMeasures: 0,
    });
  });

  it('should return correct values if there is max, min are functions without parameter', () => {
    dataDefinition = {
      dimensions: { max: () => 2, min: () => 1 },
      measures: { max: () => 10, min: () => 0 },
    };
    const result = helpers.getMaxMinDimensionMeasure({ exportFormat, dataDefinition });

    expect(result).to.deep.equal({
      maxDimensions: 2,
      minDimensions: 1,
      maxMeasures: 10,
      minMeasures: 0,
    });
  });

  it('should return correct values if there is max, min are functions with parameter', () => {
    dataDefinition = {
      dimensions: { max: (x) => x + 4, min: (x) => x + 2 },
      measures: { max: (x) => x + 3, min: (x) => x + 1 },
    };
    exportFormat.data[0].dimensions.length = 2;
    const result = helpers.getMaxMinDimensionMeasure({ exportFormat, dataDefinition });

    expect(result).to.deep.equal({
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

    it('should return false if dimensions.length = 0', () => {
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(false);
    });

    it('should return true if dimensions.length > 0', () => {
      exportFormat.data[0].dimensions.length = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(true);
    });
  });

  describe('maxDimensions > 0', () => {
    beforeEach(() => {
      maxDimensions = 3;
    });

    it('should return false if dimensions.length < maxDimensions', () => {
      exportFormat.data[0].dimensions.length = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(false);
    });

    it('should return false if dimensions.length = maxDimensions', () => {
      exportFormat.data[0].dimensions.length = 3;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(false);
    });

    it('should return false if dimensions.length > maxDimensions', () => {
      exportFormat.data[0].dimensions.length = 4;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(true);
    });
  });

  describe('maxMeasures = 0', () => {
    beforeEach(() => {
      maxMeasures = 0;
    });

    it('should return false if measures.length = 0', () => {
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(false);
    });

    it('should return true if measures.length > 0', () => {
      exportFormat.data[0].measures.length = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(true);
    });
  });

  describe('maxMeasures > 0', () => {
    beforeEach(() => {
      maxMeasures = 3;
    });

    it('should return false if measures.length < maxMeasures', () => {
      exportFormat.data[0].measures.length = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(false);
    });

    it('should return false if measures.length = maxMeasures', () => {
      exportFormat.data[0].measures.length = 3;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(false);
    });

    it('should return false if measures.length > maxMeasures', () => {
      exportFormat.data[0].measures.length = 4;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(true);
    });
  });

  describe('dimensions.length <= maxDimensions and excludedDimensions.length = 0', () => {
    beforeEach(() => {
      maxDimensions = 4;
      minDimensions = 2;
      exportFormat.data[0].excludedDimensions.length = 0;
    });

    it('should return false if dimensions.length < minDimensions', () => {
      exportFormat.data[0].dimensions.length = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(false);
    });

    it('should return false if dimensions.length = minDimensions', () => {
      exportFormat.data[0].dimensions.length = 2;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(false);
    });

    it('should return false if dimensions.length > minDimensions', () => {
      exportFormat.data[0].dimensions.length = 3;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(false);
    });

    it('should return false if dimensions.length = maxDimensions and > minDimensions', () => {
      exportFormat.data[0].dimensions.length = 4;
      minDimensions = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(false);
    });
  });

  describe('dimensions.length <= maxDimensions and excludedDimensions.length > 0', () => {
    beforeEach(() => {
      maxDimensions = 5;
      minDimensions = 3;
      exportFormat.data[0].excludedDimensions.length = 1;
    });

    it('should return false if dimensions.length + excludedDimensions.length < minDimensions', () => {
      exportFormat.data[0].dimensions.length = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(false);
    });

    it('should return false if dimensions.length + excludedDimensions.length = minDimensions', () => {
      exportFormat.data[0].dimensions.length = 2;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(false);
    });

    it('should return false if dimensions.length + excludedDimensions.length > minDimensions', () => {
      exportFormat.data[0].dimensions.length = 3;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(true);
    });

    it('should return false if dimensions.length = maxDimensions and > minDimensions', () => {
      exportFormat.data[0].dimensions.length = 5;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(true);
    });
  });

  describe('measures.length <= maxMeasures and excludedMeasures.length = 0', () => {
    beforeEach(() => {
      maxMeasures = 4;
      minMeasures = 2;
      exportFormat.data[0].excludedMeasures.length = 0;
    });

    it('should return false if measures.length < minMeasures', () => {
      exportFormat.data[0].measures.length = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(false);
    });

    it('should return false if measures.length = minMeasures', () => {
      exportFormat.data[0].measures.length = 2;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(false);
    });

    it('should return false if measures.length > minMeasures', () => {
      exportFormat.data[0].measures.length = 3;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(false);
    });

    it('should return false if measures.length = maxMeasures and > minMeasures', () => {
      exportFormat.data[0].measures.length = 4;
      minMeasures = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(false);
    });
  });

  describe('measures.length <= maxMeasures and excludedMeasures.length > 0', () => {
    beforeEach(() => {
      maxMeasures = 5;
      minMeasures = 3;
      exportFormat.data[0].excludedMeasures.length = 1;
    });

    it('should return false if measures.length + excludedMeasures.length < minMeasures', () => {
      exportFormat.data[0].measures.length = 1;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(false);
    });

    it('should return false if measures.length + excludedMeasures.length = minMeasures', () => {
      exportFormat.data[0].measures.length = 2;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(false);
    });

    it('should return false if measures.length + excludedMeasures.length > minMeasures', () => {
      exportFormat.data[0].measures.length = 3;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(true);
    });

    it('should return false if measures.length = maxMeasures and > minMeasures', () => {
      exportFormat.data[0].measures.length = 5;
      expect(
        helpers.shouldInitLayoutExclude({ exportFormat, maxDimensions, minDimensions, maxMeasures, minMeasures })
      ).to.equal(true);
    });
  });
});

describe('checkLibraryObjects', () => {
  let exportFormat;
  let dimensionList;
  let measureList;

  beforeEach(() => {
    exportFormat = {
      data: [
        {
          dimensions: [
            {
              title: 'title0',
            },
            {
              qLibraryId: 'id1',
            },
            {
              qLibraryId: 'id2',
            },
          ],
          measures: [
            {
              title: 'title10',
            },
            {
              qLibraryId: 'id11',
            },
            {
              qLibraryId: 'id12',
            },
          ],
          excludedDimensions: [],
          excludedMeasures: [],
        },
      ],
    };
    dimensionList = [
      {
        qInfo: { qId: 'id1' },
        qData: { title: 'title1' },
      },
    ];
    measureList = [
      {
        qInfo: { qId: 'id11' },
        qData: { title: 'title11' },
      },
    ];
  });

  it('should return false if measures.length + excludedMeasures.length < minMeasures', () => {
    helpers.checkLibraryObjects({ exportFormat, dimensionList, measureList });
    expect(exportFormat).to.deep.equal({
      data: [
        {
          dimensions: [
            {
              title: 'title0',
            },
            {
              qLibraryId: 'id1',
              title: 'title1',
            },
            {
              qLibraryId: 'id2',
            },
          ],
          measures: [
            {
              title: 'title10',
            },
            {
              qLibraryId: 'id11',
              title: 'title11',
            },
            {
              qLibraryId: 'id12',
            },
          ],
          excludedDimensions: [],
          excludedMeasures: [],
        },
      ],
    });
  });
});
