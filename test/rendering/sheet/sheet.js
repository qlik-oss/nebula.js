/* global configured */
/* eslint no-underscore-dangle: 0 */
(() => {
  async function getMocks(EnigmaMocker) {
    const { getSheetLayout, getSheetLayout2, getBarLayout, getPieLayout } = window.getFuncs();

    const obj = [
      {
        id: `sheet`,
        type: 'sheet',
        getLayout: () => getSheetLayout(),
      },
      {
        id: `boundLessSheet`,
        type: 'sheet',
        getLayout: () => getSheetLayout2(),
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
    const urlParams = new URLSearchParams(window.location.search);
    const target = urlParams.get('target');
    const element = document.querySelector('#object');
    const { app } = await getMocks(window.stardust.EnigmaMocker);

    const nebbie = configured(app);

    const inst = await nebbie.render({ id: target, element });
    return () => {
      inst?.unmount(element);
    };
  };

  return init();
})();
