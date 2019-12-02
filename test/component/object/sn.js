export default {
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
            min: 0,
            max: 0,
          },
        },
      ],
    },
  },
};
