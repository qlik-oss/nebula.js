import nucleus from '@nebula.js/nucleus';

import { openApp, params, info as serverInfo } from './connect';

const nuke = async ({ app, supernova: { name }, themes, theme }) => {
  const nuked = nucleus.configured({
    themes: themes
      ? themes.map(t => ({
          key: t,
          load: async () => (await fetch(`/theme/${t}`)).json(),
        }))
      : undefined,
    theme,
    types: [
      {
        name,
      },
    ],
  });
  const nebbie = nuked(app, {
    load: (type, config) => config.Promise.resolve(window[type.name]),
  });
  return nebbie;
};

async function renderWithEngine() {
  if (!params.app) {
    location.href = location.origin; //eslint-disable-line
  }
  const info = await serverInfo;
  const app = await openApp(params.app);
  const nebbie = await nuke({ app, ...info, theme: params.theme });
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
  const info = await serverInfo;
  const element = document.querySelector('#chart-container');
  element.classList.toggle('full', true);
  const snapshot = await (await fetch(`/snapshot/${params.snapshot}`)).json();
  const layout = {
    ...snapshot.layout,
    visualization: info.supernova.name,
  };

  const {
    meta: { theme },
  } = snapshot;

  const objectModel = {
    async getLayout() {
      return layout;
    },
    on() {},
    once() {},
  };

  const app = {
    async getObject(id) {
      if (id === layout.qInfo.qId) {
        return objectModel;
      }
      return Promise.reject();
    },
  };

  const nebbie = await nuke({ app, ...info, theme });
  const getCfg = {
    id: layout.qInfo.qId,
  };
  const vizCfg = {
    element,
    context: {
      permissions: ['passive'],
    },
    options: {
      onInitialRender() {
        document.querySelector('.nebulajs-sn').setAttribute('data-rendered', '1');
      },
    },
  };
  const render = () => {
    nebbie.get(getCfg, vizCfg);
  };

  window.onHotChange(info.supernova.name, () => render());
}

if (params.snapshot) {
  renderSnapshot();
} else {
  renderWithEngine();
}
