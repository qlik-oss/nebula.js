const incompleteSn = {
  component: {
    mounted(element) {
      element.textContent = 'Hello engine!'; // eslint-disable-line no-param-reassign
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
    sn: incompleteSn,
    snConfig: {},
  };
}
