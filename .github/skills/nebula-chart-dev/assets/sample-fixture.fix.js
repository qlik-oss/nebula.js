export default function fixture() {
  return {
    type: "my-chart",
    genericObjects: [
      {
        getLayout() {
          return {
            qInfo: {
              qId: "sample-fixture",
              qType: "my-chart",
            },
            visualization: "my-chart",
            qSelectionInfo: {},
            qHyperCube: {
              qSize: {
                qcx: 2,
                qcy: 4,
              },
              qDimensionInfo: [
                {
                  qFallbackTitle: "Category",
                  qGrouping: "N",
                },
              ],
              qMeasureInfo: [
                {
                  qFallbackTitle: "Value",
                },
              ],
              qDataPages: [
                {
                  qMatrix: [
                    [
                      {
                        qText: "A",
                        qNum: 0,
                        qElemNumber: 0,
                        qState: "O",
                      },
                      {
                        qText: "10",
                        qNum: 10,
                        qElemNumber: -1,
                        qState: "L",
                      },
                    ],
                    [
                      {
                        qText: "B",
                        qNum: 1,
                        qElemNumber: 1,
                        qState: "O",
                      },
                      {
                        qText: "20",
                        qNum: 20,
                        qElemNumber: -1,
                        qState: "L",
                      },
                    ],
                    [
                      {
                        qText: "C",
                        qNum: 2,
                        qElemNumber: 2,
                        qState: "O",
                      },
                      {
                        qText: "15",
                        qNum: 15,
                        qElemNumber: -1,
                        qState: "L",
                      },
                    ],
                    [
                      {
                        qText: "D",
                        qNum: 3,
                        qElemNumber: 3,
                        qState: "O",
                      },
                      {
                        qText: "5",
                        qNum: 5,
                        qElemNumber: -1,
                        qState: "L",
                      },
                    ],
                  ],
                },
              ],
            },
            props: {
              baseColor: {
                color: "#ff0000",
              },
            },
          };
        },

        getEffectiveProperties() {
          return {
            qInfo: {
              qType: "my-chart",
            },
            qHyperCubeDef: {
              qDimensions: [],
              qMeasures: [],
            },
          };
        },
      },
    ],
  };
}
