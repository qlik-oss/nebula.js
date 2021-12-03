import { embed } from '@nebula.js/stardust';
import EnigmaMocker from '@nebula.js/enigma-mocker';
import extend from 'extend';
import { info as getServerInfo } from './connect';
import { getModule } from './hot';

const getDefaultGenericObject = ({ type }) => ({
  getLayout: {
    qInfo: { qId: +Date.now() },
    visualization: type,
  },
});

const getServeOptions = ({ themes = [], supernova, flags }) => ({
  type: supernova.name,
  load: async () => getModule(supernova.name, supernova.url),
  instanceConfig: {
    themes: themes.map((t) => ({
      id: t,
      load: async () => (await fetch(`/theme/${t}`)).json(),
    })),
    context: {
      constraints: {},
    },
    flags,
  },
});

const getUrlParamOptions = (params) => ({
  instanceConfig: {
    context: {
      theme: params.theme,
      language: params.language,
    },
  },
});

async function getOptions({ params, fixture, serverInfo }) {
  const options = extend(true, {}, getServeOptions(serverInfo), fixture, getUrlParamOptions(params));
  options.genericObjects = options.genericObjects || [getDefaultGenericObject({ type: options.type })];
  return options;
}

function validateFixture({ genericObjects } = {}) {
  if (!genericObjects || genericObjects.length === 0) {
    return;
  }
  if (!genericObjects[0] || !genericObjects[0].getLayout) {
    throw new Error('Invalid getLayout of generic object');
  }
  const { getLayout } = genericObjects[0];
  const layout = typeof getLayout === 'function' ? getLayout() : getLayout;
  if (!layout.visualization) {
    throw new Error('No "visualization" specified on generic object on path "getLayout"');
  }
  if (!layout.qInfo || !layout.qInfo.qId) {
    throw new Error('No "qId" specified on generic object on path "getLayout.qInfo');
  }
}

async function getFixture(fixturePath) {
  const fixtureFn = window.serveFixtures.get(fixturePath);
  if (!fixtureFn) {
    throw new Error(`Unable to load fixture ${fixturePath}`);
  }

  const fixture = fixtureFn();
  validateFixture(fixture);

  return fixture;
}

function getQId(genericObjects = []) {
  const { getLayout } = genericObjects[0];
  const layout = typeof getLayout === 'function' ? getLayout() : getLayout;

  return layout.qInfo.qId;
}

const renderFixture = async (params) => {
  const element = document.querySelector('#chart-container');
  const serverInfo = await getServerInfo;
  const fixture = await getFixture(params.fixture);
  const { type, load, genericObjects, instanceConfig, snConfig } = await getOptions({ fixture, params, serverInfo });
  const mockedApp = await EnigmaMocker.fromGenericObjects(genericObjects);
  const qId = getQId(genericObjects);

  const nebbie = embed(mockedApp, {
    types: [
      {
        name: type,
        load,
      },
    ],
    ...instanceConfig,
  });
  nebbie.render({ type, element, id: qId, ...snConfig });
};

export default renderFixture;
