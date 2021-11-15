import SessionMock from './mocks/session-mock';
import CreateSessionObjectMock from './mocks/create-session-object-mock';
import GetObjectMock from './mocks/get-object-mock';
import GetAppLayoutMock from './mocks/get-app-layout-mock';

/**
 * Mocks Engima app functionality. It accepts a fixture as input argument and returns the mocked Enigma app. The fixture specifies how the mock should behave. For example, how should the layout of the chart be configured and what data to display.
 *
 * The fixture is a JavaScript object with a number of properties. The name of the property correlates to the function name in Enigma. For example the property `getLayout` in the fixture is used to define `app.getObject().getLayout()` . Any property can be added to the fixture (just make sure it exists and behaves as in Enigma!).
 *
 * The property value in the fixture is either fixed (string / boolean / number / object) or a function. Arguments are forwarded to the function to allow for greater flexibility. For example, this can be used to return different hypercube data when scrolling in the chart.
 *
 * @param {object} fixture Fixture to base mock on.
 * @returns {Promise<enigma.Dock>}
 * @example
 * const fixture = {
 *   getLayout() {
 *     return {
 *       qInfo: {
 *         qId: 'qqj4zx',
 *         qType: 'sn-grid-chart'
 *       },
 *       ...
 *     }
 *   },
 *   getHyperCubeData(path, page) {
 *     return [ ... ];
 *   }
 * };
 * const app = await EnigmaMocker.fromFixture(fixture);
 */
export default (fixture) => {
  if (!fixture || fixture.length === 0) {
    throw new Error('No "fixture" specified');
  }

  const objects = Array.isArray(fixture) ? fixture : [fixture];

  const session = new SessionMock();
  const createSessionObject = new CreateSessionObjectMock();
  const getObject = new GetObjectMock(objects);
  const getAppLayout = new GetAppLayoutMock();

  const app = {
    id: `app - ${+Date.now()}`,
    session,
    createSessionObject,
    getObject,
    getAppLayout,
  };

  return Promise.resolve(app);
};
