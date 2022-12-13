/* global configured */
/* eslint no-underscore-dangle: 0 */
(() => {
  async function getMocks(EnigmaMocker) {
    const { getSheetLayout, getBarLayout, getPieLayout } = window.getFuncs();

    const obj = [
      {
        id: `sheet`,
        type: 'sheet',
        getLayout: () => getSheetLayout(),
      },
      {
        id: `bar`,
        type: 'barchart',
        getLayout: () => getBarLayout(),
      },
      {
        id: `pie`,
        type: 'piechart',
        getLayout: () => getPieLayout(),
      },
    ];

    const app = await EnigmaMocker.fromGenericObjects(obj);

    return {
      obj,
      app,
    };
  }

  const init = async () => {
    const element = document.querySelector('#object');
    const { app } = await getMocks(window.stardust.EnigmaMocker);

    const nebbie = configured(app);

    const inst = await nebbie.render({ id: 'sheet', element });
    return () => {
      inst?.unmount(element);
    };
  };

  return init();
})();
