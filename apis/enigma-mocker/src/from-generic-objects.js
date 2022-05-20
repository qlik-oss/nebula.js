import SessionMock from './mocks/session-mock';
import CreateSessionObjectMock from './mocks/create-session-object-mock';
import GetObjectMock from './mocks/get-object-mock';
import GetAppLayoutMock from './mocks/get-app-layout-mock';

/**
 * @interface EnigmaMockerOptions
 * @property {number} delay Simulate delay (in ms) for calls in enigma-mocker.
 */

/**
 * Mocks Engima app functionality. It accepts one / many generic objects as input argument and returns the mocked Enigma app. Each generic object represents one visulization and specifies how it behaves. For example, what layout to use the data to present.
 *
 * The generic object is represented with a Javascript object with a number of properties. The name of the property correlates to the name in the Enigma model for `app.getObject(id)`. For example, the property `getLayout` in the generic object is used to define `app.getObject(id).getLayout()`. Any property can be added to the fixture (just make sure it exists and behaves as in the Enigma model!).
 *
 * The value for each property is either fixed (string / boolean / number / object) or a function. Arguments are forwarded to the function to allow for greater flexibility. For example, this can be used to return different hypercube data when scrolling in the chart.
 *
 * @param {Array<object>} genericObjects Generic objects controling behaviour of visualizations.
 * @param {EnigmaMockerOptions} options Options
 * @returns {Promise<enigma.Doc>}
 * @example
 * const genericObject = {
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
 * const app = await EnigmaMocker.fromGenericObjects([genericObject]);
 */
export default (genericObjects, options = {}) => {
  const session = new SessionMock();
  const createSessionObject = new CreateSessionObjectMock();
  const getObject = new GetObjectMock(genericObjects, options);
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
