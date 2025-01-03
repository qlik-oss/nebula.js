export default function picassoDefinition({ layout }) {
  if (!layout.qHyperCube) {
    throw new Error('Layout is missing a hypercube');
  }
  return {
    scales: {
      x: { data: { extract: { field: 'qDimensionInfo/0' } } },
      y: {
        data: { field: 'qMeasureInfo/0' },
        expand: 0.2,
        include: [0],
        invert: true,
        min: 0,
      },
    },
    components: [
      {
        type: 'axis',
        dock: 'left',
        scale: 'y',
      },
      {
        type: 'axis',
        dock: 'bottom',
        scale: 'x',
      },
      {
        type: 'box',
        data: {
          extract: {
            field: 'qDimensionInfo/0',
            props: {
              start: 0,
              end: { field: 'qMeasureInfo/0' },
            },
          },
        },
        settings: {
          major: { scale: 'x' },
          minor: { scale: 'y' },
          box: {
            width: 0.7,
          },
        },
      },
    ],
  };
}
