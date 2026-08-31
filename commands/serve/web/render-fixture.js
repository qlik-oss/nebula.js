import { embed } from '@nebula.js/stardust';
import EnigmaMocker from '@nebula.js/enigma-mocker';
import extend from 'extend';
import { getConnectionInfo } from './connect';
import { getModule } from './hot';

const getDefaultGenericObject = ({ type }) => ({
  getLayout: {
    qInfo: { qId: +Date.now() },
    visualization: type,
  },
});

const getServeOptions = ({ themes = [], supernova = {}, flags, anything }) => {
  const options = {
    instanceConfig: {
      themes: themes.map((t) => ({
        id: t,
        load: async () => (await fetch(`/theme/${t}`)).json(),
      })),
      context: {
        constraints: {},
      },
      flags,
      anything,
    },
  };
  if (supernova.name) {
    options.type = supernova.name;
  }
  if (supernova.name || supernova.url) {
    options.load = async () => getModule(supernova.name, supernova.url);
  }

  return options;
};

const getUrlParamOptions = (params) => ({
  instanceConfig: {
    context: {
      theme: params.theme,
      language: params.language,
      keyboardNavigation: params.keyboardNavigation,
    },
  },
});

function validateOptions(options) {
  if (!options.type) {
    throw new Error(
      'No visualization type. Specify it either in fixture in the property "type" or as "--type" to Nebula serve.'
    );
  }
  if (!options.load) {
    throw new Error('Unable to load the visualization. Specify it in option "--entry" to Nebula serve.');
  }
}

async function getOptions({ params, fixture, serverInfo }) {
  const options = extend(true, {}, getServeOptions(serverInfo), fixture, getUrlParamOptions(params));
  options.genericObjects = options.genericObjects || [getDefaultGenericObject({ type: options.type })];

  validateOptions(options);

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

const waitForVizGone = (element) =>
  new Promise((resolve) => {
    const check = () => {
      if (!element.querySelector('.njs-viz')) resolve();
      else requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });

const waitForRenderCountAbove = (element, count) =>
  new Promise((resolve) => {
    const check = () => {
      const vizEl = element.querySelector('.njs-viz[data-render-count]');
      if (vizEl && parseInt(vizEl.getAttribute('data-render-count'), 10) > count) resolve();
      else requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });

const renderFixture = async (params) => {
  const element = document.querySelector('#chart-container');
  const rerenders = params.rerenders ? parseInt(params.rerenders, 10) : 0;
  const serverInfo = await getConnectionInfo();
  const fixture = await getFixture(params.fixture);
  const { type, load, genericObjects, instanceConfig, snConfig, enigmaMockerOptions } = await getOptions({
    fixture,
    params,
    serverInfo,
  });

  const mockedApp = await EnigmaMocker.fromGenericObjects(genericObjects, enigmaMockerOptions);
  const qId = getQId(genericObjects);

  // When ?simulatedMemLeakKB=<n>: patch the mock object to support real event emission so nebula
  // re-calls getLayout on every 'changed' event. Each getLayout call accumulates plain JS objects
  // totalling ~n KB, pinned via element.leakStore so GC cannot collect them. Use together with
  // ?rerenders to verify that your memory measurement infrastructure detects a real leak before
  // trusting clean-chart results.
  // 48 bytes is the measured V8 heap cost of one { j, v } object.
  let leakMock = null;
  if (params.simulatedMemLeakKB) {
    const leakKB = parseFloat(params.simulatedMemLeakKB);
    const itemCount = Math.round((leakKB * 1024) / 48);
    leakMock = await mockedApp.getObject(qId);
    const evListeners = {};
    leakMock.on = (event, fn) => {
      (evListeners[event] = evListeners[event] || []).push(fn);
    };
    leakMock.once = (event, fn) => {
      const wrapper = () => {
        fn();
        leakMock.removeListener(event, wrapper);
      };
      leakMock.on(event, wrapper);
    };
    leakMock.removeListener = (event, fn) => {
      if (evListeners[event]) evListeners[event] = evListeners[event].filter((h) => h !== fn);
    };
    leakMock.emit = (event) => {
      (evListeners[event] || []).forEach((h) => h());
    };
    // Pin to the DOM element so the store stays reachable after renderFixture returns.
    element.leakStore = [];
    const origGetLayout = leakMock.getLayout.bind(leakMock);
    leakMock.getLayout = async () => {
      element.leakStore.push(new Array(itemCount).fill(null).map((_, j) => ({ j, v: Math.random() })));
      return origGetLayout();
    };
  }
  const servedTypes = (serverInfo && serverInfo.types) || [];
  const nebbie = embed(mockedApp, {
    types: [
      {
        name: type,
        load,
      },
      ...servedTypes.map((configType) => ({
        name: configType.name,
        load: async () => getModule(configType.name, configType.url),
      })),
    ],
    ...instanceConfig,
  });
  const viz = await nebbie.render({
    type,
    element,
    id: qId,
    ...snConfig,
  });
  const events = snConfig?.events || [];
  events.forEach((e) => {
    viz.addListener(e, (message) => {
      document.querySelector('#events').innerHTML = message;
    });
  });

  let currentViz = viz;

  const runRerenders = async (count) => {
    for (let i = 0; i < count; i++) {
      // eslint-disable-next-line no-await-in-loop
      await currentViz.destroy();
      // eslint-disable-next-line no-await-in-loop
      await waitForVizGone(element);
      // eslint-disable-next-line no-await-in-loop
      currentViz = await nebbie.render({ type, element, id: qId, ...snConfig });
      // eslint-disable-next-line no-await-in-loop
      await waitForRenderCountAbove(element, 0);
      if (leakMock) {
        const currentCount = parseInt(
          element.querySelector('.njs-viz[data-render-count]').getAttribute('data-render-count'),
          10
        );
        leakMock.emit('changed');
        // eslint-disable-next-line no-await-in-loop
        await waitForRenderCountAbove(element, currentCount);
      }
      element.setAttribute('data-render-count', String(i + 1));
    }
  };

  if (rerenders > 0) {
    await waitForRenderCountAbove(element, 0);
    await runRerenders(rerenders);
  }
};

export default renderFixture;
