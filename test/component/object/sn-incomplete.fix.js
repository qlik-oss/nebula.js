const incompleteSn = {
  component: {
    mounted(element) {
      element.textContent = 'Hello engine2!'; // eslint-disable-line no-param-reassign
    },
  },
  qae: {
    data: {
      targets: [
        {
          path: '/qHyperCubeDef',
          dimensions: {
            min: 1,
            max: 1,
          },
        },
      ],
    },
  },
};

export default function fixture() {
  return {
    type: 'incomplete-sn',
    load: async () => incompleteSn,
    genericObjects: [
      {
        getLayout() {
          return {
            qInfo: { qId: 'bb8' },
            visualization: 'incomplete-sn',
          };
        },
        getProperties() {
          return null;
        },
      },
    ],
  };
}
