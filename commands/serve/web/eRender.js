import nucleus from '@nebula.js/nucleus';
import snapshooter from '@nebula.js/snapshooter/dist/renderer';

import { openApp, params, info as serverInfo } from './connect';
import runFixture from './run-fixture';

const nuke = async ({ app, supernova: { name }, themes, theme, language }) => {
  const nuked = nucleus.configured({
    themes: themes
      ? themes.map(t => ({
          key: t,
          load: async () => (await fetch(`/theme/${t}`)).json(),
        }))
      : undefined,
    context: {
      theme,
      language,
    },
  });
  const nebbie = nuked(app, {
    load: type => Promise.resolve(window[type.name]),
    types: [
      {
        name,
      },
    ],
  });
  return nebbie;
};

async function renderWithEngine() {
  if (!params.app) {
    location.href = location.origin; //eslint-disable-line
  }
  const info = await serverInfo;
  const app = await openApp(params.app);
  const nebbie = await nuke({ app, ...info, theme: params.theme, language: params.language });
  const element = document.querySelector('#chart-container');
  const vizCfg = {
    element,
    context: {
      permissions: params.permissions || [],
    },
  };
  const getCfg = params.object
    ? {
        id: params.object,
      }
    : {
        type: info.supernova.name,
        fields: params.cols || [],
      };

  const render = async () => {
    await nebbie[params.object ? 'get' : 'create'](getCfg, vizCfg);
  };

  let viz;
  window.onHotChange(info.supernova.name, async () => {
    if (viz) {
      viz.close();
      nebbie.types.clearFromCache(info.supernova.name);
      nebbie.types.register(info.supernova);
    }
    viz = await render();
  });
}

async function renderSnapshot() {
  const { themes, supernova } = await serverInfo;
  const element = document.querySelector('#chart-container');
  element.classList.toggle('full', true);

  const n = nucleus.configured({
    themes: themes
      ? themes.map(t => ({
          key: t,
          load: async () => (await fetch(`/theme/${t}`)).json(),
        }))
      : undefined,
    types: [
      {
        load: type => Promise.resolve(window[type.name]),
        name: supernova.name,
      },
    ],
  });

  window.onHotChange(supernova.name, async () => {
    snapshooter({
      nucleus: n,
      element,
    });
  });
}

const renderFixture = async () => {
  const element = document.querySelector('#chart-container');
  const { theme } = params;
  const { themes } = await serverInfo;
  const fixture = runFixture(params.fixture);
  const { instanceConfig, type, sn, object, snConfig } = fixture();
  const config = {
    themes: themes
      ? themes.map(t => ({
          key: t,
          load: async () => (await fetch(`/theme/${t}`)).json(),
        }))
      : undefined,
    context: {
      theme,
      language: params.language,
    },
  };
  let mockedProps = {};
  let mockedLayout = {};
  const mockedObject = {
    id: `${+new Date()}`,
    ...mockedProps,
    ...object,
    // beginSelections: async () => {},
    // selectHyperCubeValues: async (path, dimNo, values, toggleMode) => {
    //   console.log(path, dimNo, values, toggleMode);
    // },
    // resetMadeSelections: async () => {},
    getLayout:
      object && object.getLayout
        ? async () => {
            const layout = await object.getLayout();
            mockedLayout = {
              ...mockedProps,
              ...layout,
            };
            return mockedLayout;
          }
        : async () => ({
            ...mockedProps,
          }),
    on() {},
    once() {},
  };

  const mockedApp = {
    // eslint-disable-next-line no-return-assign
    createSessionObject: async p => {
      mockedProps = p;
      return mockedObject;
    },
    getObject: async () => mockedObject,
  };

  const nebbie = nucleus(mockedApp, {
    ...config,
    ...instanceConfig,
    types: [
      {
        name: type,
        load: async () => sn,
      },
    ],
  });
  nebbie.create({ type }, { ...snConfig, element });
};

if (params.fixture) {
  renderFixture();
} else if (params.snapshot) {
  renderSnapshot();
} else {
  renderWithEngine();
}
