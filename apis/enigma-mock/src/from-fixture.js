import { getPropValue, getPropFn } from './prop';

function GetObjectMock(fixture) {
  if (!fixture.getLayout) {
    throw new Error('Fixture is missing "getLayout"');
  }

  const {
    id,
    session,
    getEffectiveProperties,
    getLayout,
    selectHyperCubeValues,
    rangeSelectHyperCubeValues,
    beginSelections,
    resetMadeSelections,
    getHyperCubeTreeData,
    getHyperCubeData,
    getHyperCubeReducedData,
    getHyperCubeContinuousData,
    getHyperCubeStackData,
    ...rest
  } = fixture;

  return () =>
    Promise.resolve({
      id: getPropValue(id, { defaultValue: `object - ${+Date.now()}` }),
      session: getPropValue(session, { defaultValue: true }),
      on: () => {},
      once: () => {},
      getEffectiveProperties: getPropFn(getEffectiveProperties, { defaultValue: {} }),
      getLayout: getPropFn(getLayout),
      selectHyperCubeValues: getPropFn(selectHyperCubeValues, { defaultValue: true }),
      rangeSelectHyperCubeValues: getPropFn(rangeSelectHyperCubeValues, { defaultValue: true }),
      beginSelections: getPropFn(beginSelections, { defaultValue: true }),
      resetMadeSelections: getPropFn(resetMadeSelections, { defaultValue: true }),
      getHyperCubeTreeData: getPropFn(getHyperCubeTreeData, { defaultValue: [] }),
      getHyperCubeData: getPropFn(getHyperCubeData, { defaultValue: [] }),
      getHyperCubeReducedData: getPropFn(getHyperCubeReducedData),
      getHyperCubeContinuousData: getPropFn(getHyperCubeContinuousData),
      getHyperCubeStackData: getPropFn(getHyperCubeStackData),
      ...rest,
    });
}

function CreateSessionObjectMock() {
  return (props) =>
    Promise.resolve({
      on: () => {},
      once: () => {},
      getLayout: () => Promise.resolve({}),
      id: props?.qInfo?.qId ? props.qInfo.qId : `sel - ${+Date.now()}`,
      ...props,
    });
}

function SessionMock() {
  return {
    getObjectApi() {
      return Promise.resolve({
        id: `sessapi - ${+Date.now()}`,
      });
    },
  };
}

function GetAppLayoutMock() {
  return () => Promise.resolve({ id: 'app-layout' });
}

/**
 * Mocks Engima functionality. It accepts a fixture as input argument and returns the mocked Enigma app and a spy.
 *
 * The fixture is a JS object with a number of properties. The property names correlates to the name of the functions available in Enigma. For example the property `getLayout` in the fixture is used to define how the `enigma.getObject().getLayout()`. Any property may be added to the fixture (just make sure it exists and behaves as in Enigma!).
 *
 * Each property value in the fixture is either fixed (string / JS object / boolean / number) or a function. Arguments are forwarded to the function. For example, this can be used to return different hypercube data when scrolling in the chart.
 *
 * Example:
 * ```js
 * const fixture = {
 *   getLayout() {
 *     return {
 *       qInfo: {
 *         qId: 'qqj4zx',
 *         qType: 'sn-grid-chart'
 *       },
 *       ...
 *     }
 *   }
 * };
 * const { app } = await EnigmaMock.fromFixture(fixture);
 * ```
 */
export default (fixture) => {
  if (!fixture) {
    throw new Error('No "fixture" specified');
  }

  const session = new SessionMock();
  const createSessionObject = new CreateSessionObjectMock();
  const getObject = new GetObjectMock(fixture);
  const getAppLayout = new GetAppLayoutMock();

  const app = {
    id: `app - ${+Date.now()}`,
    session,
    createSessionObject,
    getObject,
    getAppLayout,
  };

  return Promise.resolve({ app });
};
