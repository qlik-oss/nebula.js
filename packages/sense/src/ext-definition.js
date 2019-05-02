export default {
  definition: {
    type: 'items',
    component: 'accordion',
    items: {
      data: {
        uses: 'data',
      },
      // settings: {
      //   uses: 'settings',
      // },
    },
  },
  support: {
    export: false,
    exportData: false,
    snapshot: false,
    viewData: false,
  },
};
