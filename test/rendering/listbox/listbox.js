(() => {
  function getMocks() {
    const { getMockData, getListboxLayout } = window.getFuncs();
    const obj = {
      id: `listbox-${+new Date()}`,
      getListObjectData: async () => getMockData(),
      getLayout: async () => getListboxLayout(),
      on() {},
      once() {},
    };

    const app = {
      id: `${+new Date()}`,
      session: {},
      createSessionObject: async () => obj,
      getObject: async () => obj,
      getAppLayout: async () => ({ qTitle: '', qLocaleInfo: {} }),
    };
    return {
      obj,
      app,
    };
  }

  const init = async () => {
    const element = window.document.querySelector('#object');
    const { app } = getMocks();
    const nebbie = window.stardust.embed(app);
    const listboxOptions = {
      dense: false,
    };
    const inst = await nebbie.field('Alpha');
    inst.mount(element, listboxOptions);
    return () => {
      inst?.unmount(element);
    };
  };

  return init();
})();
