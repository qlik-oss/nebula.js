const doMock = ({ helpers = {} } = {}) => aw.mock([['**/helpers/index.js', () => helpers]], ['../hypercube.js']);

describe('hypercube', () => {
  let sandbox;
  let hypercube;
  let helpers;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    helpers = {
      restoreChangedProperties: sandbox.stub(),
    };
    [{ default: hypercube }] = doMock({ helpers });
  });

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

        it('should have correct qInterColumnSortOrder when qInterColumnSortOrder = undefined', () => {
          propertyTree.qProperty.qHyperCubeDef.qInterColumnSortOrder = undefined;
          const exportFormat = hypercube.exportProperties({ propertyTree });
          expect(exportFormat.data[0].interColumnSortOrder).to.deep.equal([]);
        });

        it('should have correct qInterColumnSortOrder when qInterColumnSortOrder = []', () => {
          const exportFormat = hypercube.exportProperties({ propertyTree });
          expect(exportFormat.data[0].interColumnSortOrder).to.deep.equal([]);
        });

        it('should have correct qInterColumnSortOrder when qInterColumnSortOrder is array with values', () => {
          propertyTree.qProperty.qHyperCubeDef.qInterColumnSortOrder = [2, 1, 3];
          const exportFormat = hypercube.exportProperties({ propertyTree });
          expect(exportFormat.data[0].interColumnSortOrder).to.deep.equal([2, 1, 3]);
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

          it('should have correct qInterColumnSortOrder when qInterColumnSortOrder = undefined', () => {
            propertyTree.qProperty.qHyperCubeDef.qInterColumnSortOrder = undefined;
            const exportFormat = hypercube.exportProperties({ propertyTree });
            expect(exportFormat.data[0].interColumnSortOrder).to.deep.equal([]);
          });

          it('should have correct qInterColumnSortOrder when qInterColumnSortOrder = []', () => {
            const exportFormat = hypercube.exportProperties({ propertyTree });
            expect(exportFormat.data[0].interColumnSortOrder).to.deep.equal([]);
          });

          it('should have correct qInterColumnSortOrder when qInterColumnSortOrder is array with values', () => {
            propertyTree.qProperty.qHyperCubeDef.qInterColumnSortOrder = [2, 1, 3];
            const exportFormat = hypercube.exportProperties({ propertyTree });
            expect(exportFormat.data[0].interColumnSortOrder).to.deep.equal([2, 1, 3]);
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

          it('should have correct qInterColumnSortOrder when qInterColumnSortOrder = undefined', () => {
            propertyTree.qProperty.qHyperCubeDef.qInterColumnSortOrder = undefined;
            const exportFormat = hypercube.exportProperties({ propertyTree });
            expect(exportFormat.data[0].interColumnSortOrder).to.deep.equal([]);
          });

          it('should have correct qInterColumnSortOrder when qInterColumnSortOrder = []', () => {
            const exportFormat = hypercube.exportProperties({ propertyTree });
            expect(exportFormat.data[0].interColumnSortOrder).to.deep.equal([]);
          });

          it('should have correct qInterColumnSortOrder when qInterColumnSortOrder is array with values', () => {
            propertyTree.qProperty.qHyperCubeDef.qInterColumnSortOrder = [2, 1, 3];
            const exportFormat = hypercube.exportProperties({ propertyTree });
            expect(exportFormat.data[0].interColumnSortOrder).to.deep.equal([2, 1, 3]);
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

          it('should have correct qInterColumnSortOrder when qInterColumnSortOrder = undefined', () => {
            propertyTree.qProperty.qHyperCubeDef.qInterColumnSortOrder = undefined;
            const exportFormat = hypercube.exportProperties({ propertyTree });
            expect(exportFormat.data[0].interColumnSortOrder).to.deep.equal([]);
          });

          it('should have correct qInterColumnSortOrder when qInterColumnSortOrder = []', () => {
            const exportFormat = hypercube.exportProperties({ propertyTree });
            expect(exportFormat.data[0].interColumnSortOrder).to.deep.equal([]);
          });

          it('should have correct qInterColumnSortOrder when qInterColumnSortOrder is not an ordered-subset of qLayoutExclude.qHyperCubeDef.qInterColumnSortOrder', () => {
            propertyTree.qProperty.qHyperCubeDef.qInterColumnSortOrder = [1, 0, 2];
            const exportFormat = hypercube.exportProperties({ propertyTree });
            expect(exportFormat.data[0].interColumnSortOrder).to.deep.equal([1, 0, 2]);
          });

          it('should have correct qInterColumnSortOrder when qInterColumnSortOrder is an ordered-subset of qLayoutExclude.qHyperCubeDef.qInterColumnSortOrder', () => {
            propertyTree.qProperty.qHyperCubeDef.qInterColumnSortOrder = [1, 0];
            const exportFormat = hypercube.exportProperties({ propertyTree });
            expect(exportFormat.data[0].interColumnSortOrder).to.deep.equal([2, 1, 3, 0]);
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

      it('should have correct dimensions', () => {
        const exportFormat = hypercube.exportProperties({ propertyTree });
        expect(exportFormat.data[0].dimensions).to.deep.equal([
          { qDef: { qFieldDefs: ['Dim1'] } },
          { qDef: { qFieldDefs: ['Dim2'] } },
        ]);
      });

      it('should have correct excludedDimensions when qLayoutExclude is undefined', () => {
        const exportFormat = hypercube.exportProperties({ propertyTree });
        expect(exportFormat.data[0].excludedDimensions).to.deep.equal([]);
      });

      it('should have correct excludedDimensions when qLayoutExclude has dimensions', () => {
        propertyTree.qProperty.qHyperCubeDef.qLayoutExclude = {
          qHyperCubeDef: {
            qDimensions: [{ qDef: { qFieldDefs: ['Dim3'] } }, { qDef: { qFieldDefs: ['Dim4'] } }],
          },
        };
        const exportFormat = hypercube.exportProperties({ propertyTree });
        expect(exportFormat.data[0].excludedDimensions).to.deep.equal([
          { qDef: { qFieldDefs: ['Dim3'] } },
          { qDef: { qFieldDefs: ['Dim4'] } },
        ]);
        expect(propertyTree.qProperty.qHyperCubeDef.qLayoutExclude).to.equal(undefined);
      });

      it('should have correct measures', () => {
        const exportFormat = hypercube.exportProperties({ propertyTree });
        expect(exportFormat.data[0].measures).to.deep.equal([{ qDef: { qDef: 'Mes1' } }, { qDef: { qDef: 'Mes2' } }]);
      });

      it('should have correct excludedMeasures when qLayoutExclude is undefined', () => {
        const exportFormat = hypercube.exportProperties({ propertyTree });
        expect(exportFormat.data[0].excludedMeasures).to.deep.equal([]);
      });

      it('should have correct excludedMeasures when qLayoutExclude has measures', () => {
        propertyTree.qProperty.qHyperCubeDef.qLayoutExclude = {
          qHyperCubeDef: {
            qMeasures: [{ qDef: { qDef: 'Mes3' } }, { qDef: { qDef: 'Mes4' } }],
          },
        };
        const exportFormat = hypercube.exportProperties({ propertyTree });
        expect(exportFormat.data[0].excludedMeasures).to.deep.equal([
          { qDef: { qDef: 'Mes3' } },
          { qDef: { qDef: 'Mes4' } },
        ]);
        expect(propertyTree.qProperty.qHyperCubeDef.qLayoutExclude).to.equal(undefined);
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

      it('should be copied to exportFormat', () => {
        const exportFormat = hypercube.exportProperties({ propertyTree });
        expect(exportFormat.properties.qHyperCubeDef).to.deep.equal({
          qDimensions: [],
          qMeasures: [],
          qInterColumnSortOrder: [],
        });
        expect(exportFormat.properties.prop1).to.deep.equal({
          prop11: {
            prop111: 111,
          },
        });
      });

      it('propertyTree.qProperty.qHyperCubeDef.qLayoutExclude should be deleted', () => {
        hypercube.exportProperties({ propertyTree });
        expect(propertyTree.qProperty.qHyperCubeDef.qLayoutExclude).to.equal(undefined);
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

      it('should be copied to exportFormat', () => {
        const exportFormat = hypercube.exportProperties({ propertyTree, hypercubePath });
        expect(exportFormat.properties.qHyperCubeDef).to.deep.equal({
          qDimensions: [],
          qMeasures: [],
          qInterColumnSortOrder: [],
        });
        expect(exportFormat.properties.prop1).to.deep.equal({
          prop11: {
            prop111: 111,
          },
        });
      });

      it('qLayoutExclude should be deleted', () => {
        hypercube.exportProperties({ propertyTree, hypercubePath });
        expect(propertyTree.qProperty.boxPlotDef.qHyperCubeDef).to.equal(undefined);
      });
    });

    describe('properties.qLayoutExclude', () => {
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
            qLayoutExclude: {},
            prop1: {
              prop11: {
                prop111: 111,
              },
            },
          },
        };
      });

      it('properties.qLayoutExclude should be deleted if there is no quarantine', () => {
        hypercube.exportProperties({ propertyTree });
        expect(propertyTree.qProperty.qLayoutExclude).to.equal(undefined);
      });

      it('properties.qLayoutExclude should be deleted if quarantine is an empty object', () => {
        propertyTree.qProperty.qLayoutExclude.quarantine = {};
        hypercube.exportProperties({ propertyTree });
        expect(propertyTree.qProperty.qLayoutExclude).to.equal(undefined);
      });

      it('properties.qLayoutExclude should be kept if quarantine is an object which is not empty', () => {
        propertyTree.qProperty.qLayoutExclude.quarantine = { prop1: 1 };
        hypercube.exportProperties({ propertyTree });
        expect(propertyTree.qProperty.qLayoutExclude).to.deep.equal({ quarantine: { prop1: 1 } });
      });

      it('properties.qLayoutExclude.disabled should be copied to exportFormat.properties', () => {
        propertyTree.qProperty.qLayoutExclude.quarantine = { prop3: 3 };
        propertyTree.qProperty.qLayoutExclude.disabled = {
          prop1: {
            prop11: 110,
          },
          prop2: {
            prop21: 21,
          },
        };
        const exportFormat = hypercube.exportProperties({ propertyTree });
        expect(propertyTree.qProperty.qLayoutExclude.disabled).to.equal(undefined);
        expect(exportFormat.properties.prop1).to.deep.equal({ prop11: { prop111: 111 } });
        expect(exportFormat.properties.prop2).to.deep.equal({ prop21: 21 });
      });

      it('helpers.restoreChangedProperties should not be called if there is no properties.qLayoutExclude.changed', () => {
        propertyTree.qProperty.qLayoutExclude.quarantine = { prop3: 3 };
        hypercube.exportProperties({ propertyTree });
        expect(helpers.restoreChangedProperties.callCount).to.equal(0);
      });

      it('helpers.restoreChangedProperties should be called if there is properties.qLayoutExclude.changed', () => {
        propertyTree.qProperty.qLayoutExclude.quarantine = { prop3: 3 };
        propertyTree.qProperty.qLayoutExclude.changed = { prop4: 4 };
        hypercube.exportProperties({ propertyTree });
        expect(helpers.restoreChangedProperties.callCount).to.equal(1);
        expect(propertyTree.qProperty.qLayoutExclude.changed).to.equal(undefined);
      });
    });
  });
});
