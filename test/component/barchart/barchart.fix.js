import { hypercube } from 'qix-faker';

export default function fixture() {
  return {
    type: 'barchart',
    snConfig: {},
    instanceConfig: {
      context: {
        constraints: {
          select: false,
        },
      },
    },
    genericObjects: [
      {
        getLayout() {
          return {
            qInfo: {
              qId: 'bb8',
            },
            qHyperCubeDef: null,
            qHyperCube: hypercube({
              seed: 13,
              numRows: 20,
              dimensions: [{ value: (f) => f.address.country() }],
              measures: [(f) => f.commerce.price(10, 5000, 0, '$')],
            }),
            visualization: 'barchart',
          };
        },
      },
    ],
  };
}
