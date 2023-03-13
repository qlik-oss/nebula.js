(() => {
  function getMocks(options) {
    const { getMockData, getListboxLayout } = window.getFuncs();
    const obj = {
      id: `listbox-${+new Date()}`,
      getListObjectData: async () => getMockData(),
      getLayout: async () => getListboxLayout(options),
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

  const init = async (options = {}) => {
    const element = window.document.querySelector('#object');
    const { app } = getMocks(options);
    const nebbie = window.stardust.embed(app);
    const listboxOptions = {
      ...options,
    };
    const inst = await nebbie.field('Alpha');
    inst.mount(element, listboxOptions);
    return () => {
      inst?.unmount(element);
    };
  };

  const getOptions = () => {
    const paramStrings = document.location.search.split('?').pop().split('&');
    const paramsArr = paramStrings.map((stringPair) => {
      const [key, val] = stringPair.split('=');
      return [key, ['true', 'false'].includes(val) ? JSON.parse(val) : val];
    });
    const params = Object.fromEntries(paramsArr);
    return params;
  };

  const getScenarioOptions = (s) => {
    let sc = {};
    switch (s) {
      case 'standard':
        sc = {};
        break;
      case 'checkboxes':
        sc = { checkboxes: true };
        break;
      case 'noToolbar':
        sc = { toolbar: false };
        break;
      case 'longTitle':
        sc = { title: 'Alpha long title' };
        break;
      default:
        throw new Error('Invalid test scenario', s);
    }
    return sc;
  };

  const { scenario, ...options } = getOptions() || {};

  const scenarioOptions = getScenarioOptions(scenario);

  return init({
    ...scenarioOptions,
    ...options,
  });
})();
