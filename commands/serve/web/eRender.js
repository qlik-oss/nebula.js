/* eslint no-underscore-dangle:0 */
import { embed } from '@nebula.js/stardust';
import snapshooter from '@nebula.js/snapshooter/client';

import { openApp, params, info as serverInfo } from './connect';
import runFixture from './run-fixture';
import initiateWatch from './hot';

const nuke = async ({ app, supernova: { name }, themes, theme, language }) => {
  const nuked = embed.createConfiguration({
    themes: themes
      ? themes.map((t) => ({
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
    load: (type) => Promise.resolve(window[type.name]),
    types: [
      {
        name,
      },
    ],
  });
  return nebbie;
};

async function renderWithEngine() {
  const info = await serverInfo;
  initiateWatch(info);
  if (!info.enigma.appId) {
    location.href = location.origin; //eslint-disable-line
  }
  const app = await openApp(info.enigma.appId);
  const nebbie = await nuke({ app, ...info, theme: params.theme, language: params.language });
  const element = document.querySelector('#chart-container');
  let cfg;
  if (params['render-config']) {
    const rc = await (await fetch(`/render-config/${params['render-config']}`)).json();
    cfg = {
      ...rc,
      // eslint-disable-next-line no-nested-ternary
      ...(params.object ? { id: params.object } : rc.id ? { id: rc.id } : {}),
      type: rc.type ? rc.type : info.supernova.name,
      fields: params.cols ? params.cols : rc.fields,
      element,
    };
  } else if (params.object) {
    cfg = {
      id: params.object,
      element,
    };
  } else {
    cfg = {
      type: info.supernova.name,
      fields: params.cols || [],
      element,
    };
  }

  const render = async () => {
    await nebbie.render(cfg);
  };

  let viz;
  window.onHotChange(info.supernova.name, async () => {
    if (viz) {
      viz.close();
      nebbie.__DO_NOT_USE__.types.clearFromCache(info.supernova.name);
      nebbie.__DO_NOT_USE__.types.register(info.supernova);
    }
    viz = await render();
  });
}

async function renderSnapshot() {
  const info = await serverInfo;
  const { themes, supernova } = info;
  initiateWatch(info);
  const element = document.querySelector('#chart-container');
  element.classList.toggle('full', true);

  const n = embed.createConfiguration({
    themes: themes
      ? themes.map((t) => ({
          key: t,
          load: async () => (await fetch(`/theme/${t}`)).json(),
        }))
      : undefined,
    types: [
      {
        load: (type) => Promise.resolve(window[type.name]),
        name: supernova.name,
      },
    ],
    context: {
      constraints: {
        passive: true,
        active: true,
      },
    },
  });

  window.onHotChange(supernova.name, async () => {
    snapshooter({
      embed: n,
      element,
      snapshot: params.snapshot,
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
      ? themes.map((t) => ({
          key: t,
          load: async () => (await fetch(`/theme/${t}`)).json(),
        }))
      : undefined,
    context: {
      theme,
      language: params.language,
      constraints: {},
    },
  };
  const mockedObjects = {};
  let mockedLayout = {};
  const createObjectModel = (layout) => ({
    id: layout.qInfo.qId,
    getLayout: async () => {
      const customLayout = object && object.getLayout ? await object.getLayout() : {};
      mockedLayout = {
        ...layout,
        ...(layout.visualization ? customLayout : {}),
      };
      return mockedLayout;
    },
    getProperties: () => null,
    on() {},
    once() {},
  });

  const mockedApp = {
    id: `${+new Date()}`,
    createSessionObject: async (p) => {
      // eslint-disable-next-line no-param-reassign
      p.qInfo.qId = p.qInfo.qId || +new Date();
      mockedObjects[p.qInfo.qId] = {
        ...p,
      };
      return createObjectModel(mockedObjects[p.qInfo.qId]);
    },
    getObject: async (id) => createObjectModel(mockedObjects[id]),
    getAppLayout: async () => ({
      qTitle: 'app-title',
    }),
  };

  const nebbie = embed(mockedApp, {
    ...config,
    ...instanceConfig,
    types: [
      {
        name: type,
        load: async () => sn,
      },
    ],
  });
  nebbie.render({ type, element, ...snConfig });
};

if (params.fixture) {
  renderFixture();
} else if (params.snapshot) {
  renderSnapshot();
} else {
  renderWithEngine();
}
