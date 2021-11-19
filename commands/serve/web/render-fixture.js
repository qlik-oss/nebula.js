import { embed } from '@nebula.js/stardust';
import EnigmaMocker from '@nebula.js/enigma-mocker';
import extend from 'extend';
import runFixture from './run-fixture';
import { info as getServerInfo } from './connect';

/**
 * Options when rendering visualization from fixture.
 *
 * The options can be provided in the;
 *  * fixture,
 *  * URL as query param, or
 *  * Nebula serve configuration.
 *
 * If an option is specified in multiple ways the priority order is: URL parameters -> fixture -> Nebula serve config.
 *
 * For example, in case the fixture has dark theme configured and the URL param has light specified the visualization will use the light theme.
 *
 * Not every option is available for each source. For example, theme and language can be added as URL parameters but it's not possible to specify how to load the visualization.
 *
 * Options:
 *
 * type: name of visualization
 * @example
 * "sn-grid-chart"
 *
 * load: function loading visualization
 * @example
 * import gridChart from '@nebula.js/grid-chart';
 * async () => gridChart
 * @example
 * async (type) => ({ flags, ...what else ? }) => ({
 *   qae: {
 *     properties: {
 *       qHyperCubeDef: {},
 *       simpleMath: {
 *         qValueExpression: {
 *           qExpr: '1+1',
 *         },
 *       },
 *     },
 *   },
 *   component() {
 *     const layout = useLayout();
 *     console.log(layout); // { qHyperCube: , simpleMath: 2 }
 *   },
 * })
 * @example
 * async (type) => window[type.name] // Default
 *
 * instanceConfig: configurations when initating embed instance, `embed(app, instanceConfig)`.
 * @example
 * {
 *   context: {
 *     theme: 'dark'
 *   }
 * }
 * @example
 * {
 *   context: {
 *     constraints: {
 *       select: true
 *     }
 *   }
 * }
 *
 * snConfig: configurations when rendering supernova visualization, `nebbie.render({ snConfig })`
 * @example
 * {
 *   goodExample: {
 *     enable: true
 *   }
 * }
 *
 * genericObjects: generic objects to render visualization with. Injected into `EnigmaMocker`.
 * @example
 * [{
 *    getLayout() {
 *      return {
 *        qInfo: { qId: 'uttss2' }
 *      };
 *    }
 *    getHyperCubeData() {
 *      return [ ... ];
 *    }
 * }]
 */

const getDefaultOptions = ({ themes = [], supernova }) => ({
  type: supernova.name,
  load: async (t) => window[t.name],
  instanceConfig: {
    themes: themes.map((t) => ({
      key: t,
      load: async () => (await fetch(`/theme/${t}`)).json(),
    })),
    context: {
      constraints: {},
    },
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

// Priority: URL params -> fixture -> defaults (including nebula serve config)
function getOptions({ params, fixture, serverInfo }) {
  return extend(true, {}, getDefaultOptions(serverInfo), fixture, getUrlParamOptions(params));
}

function validateFixture({ genericObjects } = {}) {
  if (!genericObjects || !genericObjects.length === 0) {
    throw new Error('No "genericObjects" specified in fixture');
  }
  if (!genericObjects[0] || !genericObjects[0].getLayout) {
    throw new Error('Invalid getLayout of generic object');
  }
  const { getLayout } = genericObjects[0];
  const layout = getLayout === 'function' ? getLayout() : getLayout;
  if (!layout.visualization) {
    throw new Error('No "visualization" specified on generic object on path "getLayout"');
  }
  if (!layout.qInfo || !layout.qInfo.qId) {
    throw new Error('No "qId" specified on generic object on path "getLayout.qInfo');
  }
}

function getFixture(fixturePath) {
  const fixture = runFixture(fixturePath)();
  validateFixture(fixture);
  return fixture;
}

function getQId(genericObjects = []) {
  const { getLayout } = genericObjects[0];
  const layout = getLayout === 'function' ? getLayout() : getLayout;

  return layout.qInfo.qId;
}

const renderFixture = async (params) => {
  const element = document.querySelector('#chart-container');
  const serverInfo = await getServerInfo;
  const fixture = getFixture(params.fixture);
  const { type, load, genericObjects, instanceConfig, snConfig } = getOptions({ fixture, params, serverInfo });
  const qId = getQId(genericObjects);
  const mockedApp = await EnigmaMocker.fromGenericObjects(genericObjects);

  const nebbie = embed(mockedApp, {
    ...instanceConfig,
    types: [
      {
        name: type,
        load,
      },
    ],
  });
  nebbie.render({ type, element, id: qId, ...snConfig });
};

export default renderFixture;
