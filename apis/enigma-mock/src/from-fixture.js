import { getPropValue, getPropFn } from './prop';

/**
 * Properties on `getObject()` operating synchronous.
 */
const GET_OBJECT_PROPS_SYNC = [
  'addListener',
  'emit',
  'listeners',
  'on',
  'once',
  'removeAllListeners',
  'removeListener',
  'setMaxListerners',
];

function isPropAsync(name) {
  return !GET_OBJECT_PROPS_SYNC.includes(name);
}

function validateObject(object) {
  if (!object.getLayout) {
    throw new Error('Fixture is missing "getLayout" for path "getObject"');
  }
}

/**
 * Mocks `getObject()` functionality. Object(s) provided as arguments is used as basis for the mock behaves.
 *
 * Each object is represented by a javascript object where the key is the type of functionaly to mock, e.g. `getLayout` mocks the `getLayout()` function for the object.
 *
 * The value is either fixed or a dynamic. A fixed value is a string, boolean, number or object while a dynamic value is a function which is invoked when the value is needed. The function is invoked with the original arguments in order to allow it to tailor its result. For example, the `getHyperCubeData` is invoked with information about the window of data of interest.
 *
 * @param {Array<object>} objects Objects controlling mock behaviour
 * @returns The getObject mock
 */
function GetObjectMock(objects) {
  objects.forEach(validateObject);

  function getObject() {
    const [firstObject] = objects;
    return firstObject;
  }

  return () => {
    const { id, session, ...props } = getObject();

    return Promise.resolve({
      id: getPropValue(id, { defaultValue: `object - ${+Date.now()}` }),
      session: getPropValue(session, { defaultValue: true }),
      on: () => {},
      once: () => {},
      ...Object.entries(props).reduce(
        (fns, [name, value]) => ({
          ...fns,
          [name]: getPropFn(value, { async: isPropAsync(name) }),
        }),
        {}
      ),
    });
  };
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
 * Mocks Engima functionality. It accepts a fixture as input argument and returns the mocked Enigma app.
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

  return Promise.resolve({ app });
};
