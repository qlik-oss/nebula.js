import properties from './object-properties';

/**
 * Chart implementation
 */
export default function supernova(/* env */) {
  return {
    qae: {
      properties: {
        initial: properties,
      },
      data: {
        targets: [
          {
            path: '/qHyperCubeDef',
            dimensions: {
              min: 0,
              max: 2,
            },
            measures: {
              min: 0,
              max: 2,
            },
          },
        ],
      },
    },
    component() {
      // Chart implementation
      return {
        render() {
          // Render logic here
        },
      };
    },
  };
}
