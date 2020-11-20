import hypercube from '../hypercube';

describe('hypercube', () => {
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
  });
});
