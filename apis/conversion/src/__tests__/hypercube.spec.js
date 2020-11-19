import hypercube from '../hypercube';

describe('hypercube', () => {
  describe('exportProperties', () => {
    describe('default hypercubePath', () => {
      let propertyTree;
      describe('interColumnSortOrder', () => {
        describe('without qLayoutExclude', () => {
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
    });
  });
});
