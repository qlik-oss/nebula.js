(async () => {
  function getMocks(options) {
    const { getMockData, getListboxLayout } = window.getFuncs();
    const fixture = options?.fixtureFile;
    const obj = {
      id: `listbox-${+new Date()}`,
      getListObjectData: async () => (fixture ? fixture.getListObjectData() : getMockData()),
      getLayout: async () => (fixture ? fixture.getLayout() : getListboxLayout(options)),
      beginSelections: async () => {},
      selectListObjectValues: async () => true,
      searchListObjectFor: () => {},
      on() {},
      once() {},
    };

    const app = {
      id: `${+new Date()}`,
      session: {},
      evaluateEx: async () => (fixture ? fixture.evaluateEx() : null),
      createSessionObject: async () => obj,
      getObject: async () => obj,
      getAppLayout: async () => ({ qTitle: '', qLocaleInfo: {} }),
    };
    return {
      app,
    };
  }

  const init = async (options = {}, theme = 'light') => {
    const element = window.document.querySelector('#object');
    if (options?.fixtureFile?.customRenderTestElementSize) {
      element.style.width = options.fixtureFile.customRenderTestElementSize.width;
      element.style.height = options.fixtureFile.customRenderTestElementSize.height;
    }
    const { app } = getMocks(options);
    const { keyboardNavigation } = options;
    const nebbie = window.stardust.embed(app, {
      context: {
        theme,
        ...(keyboardNavigation && { keyboardNavigation }),
      },
    });
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
      case 'autoConfirm':
        sc = { autoConfirm: true };
        break;
      case 'checkboxes':
        sc = { checkboxes: true };
        break;
      case 'noToolbar':
        sc = { toolbar: false };
        break;
      case 'longTitle':
        sc = { title: 'Alpha long title that needs more words' };
        break;
      default:
        throw new Error('Invalid test scenario', s);
    }
    return sc;
  };

  const { scenario, fixture, theme, ...options } = getOptions() || {};

  let fixtureFile;

  if (fixture) {
    fixtureFile = (await import(fixture)).default;
  }
  const scenarioOptions = fixtureFile ? fixtureFile.options || {} : getScenarioOptions(scenario);

  return init(
    {
      fixtureFile,
      ...scenarioOptions,
      ...options,
    },
    theme
  );
})();
