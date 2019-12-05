import { hypercube } from 'qix-faker';
import sn from './src';

export default function fixture() {
  return {
    type: 'barchart',
    sn,
    snConfig: {
      context: {
        permissions: ['passive', 'interact'],
      },
    },
    object: {
      getLayout: async () => ({
        qHyperCubeDef: null,
        qHyperCube: hypercube({
          seed: 13,
          numRows: 20,
          dimensions: [{ value: f => f.address.country() }],
          measures: [f => f.commerce.price(10, 5000, 0, '$')],
        }),
      }),
    },
  };
}
