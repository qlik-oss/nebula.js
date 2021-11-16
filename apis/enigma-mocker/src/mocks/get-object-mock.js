import { getPropValue, getPropFn } from '../prop';

/**
 * Properties on `getObject()` operating synchronously.
 */
const PROPS_SYNC = [
  'addListener',
  'emit',
  'listeners',
  'on',
  'once',
  'removeAllListeners',
  'removeListener',
  'setMaxListerners',
];

/**
 * Is property operating asynchrously.
 * @param {string} name Property name.
 * @returns `true` if property is operating asynchrously, otherwise `false`.
 */
function isPropAsync(name) {
  return !PROPS_SYNC.includes(name);
}

/**
 * Create a mock from a generic object. Mandatory properties are added, function returns async values where applicable etc.
 * @param {object} genericObject Generic object describing behaviour of mock
 * @returns The mocked object
 */
function createMock(genericObject) {
  const { id, session, ...props } = genericObject;
  return {
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
  };
}

/**
 * Registry of mocks for generic objects. Mocks are created with the `initializer` argument to apply mock.
 * @param {Array<object>} genericObjects Generic objects.
 * @param {function} initializer Initializes entries in the registry.
 * @returns The registry api
 */
function Registry(genericObjects, initializer) {
  const items = genericObjects.map(initializer);

  return {
    find(id) {
      return items.find(async (object) => (await object.getLayout()).qInfo.qId === id);
    },
  };
}

/**
 * Validates if mandatory information is available.
 * @param {object} genericObject Generic object to validate
 * @throws {}
 * <ul>
 *   <li>{Error} If getLayout is missing</li>
 *   <li>{Error} If getLayout.qInfo.qId is missing</li>
 * </ul>
 */
function validate(genericObject) {
  if (!genericObject.getLayout) {
    throw new Error('Generic object is missing "getLayout"');
  }
  const layout = getPropValue(genericObject.getLayout);
  if (!layout.qInfo?.qId) {
    throw new Error('Generic object is missing "qId" for path "getLayout().qInfo.qId"');
  }
}

/**
 * Creates mock of `getObject(id)` based on an array of generic objects.
 * @param {Array<object>} genericObjects Generic objects.
 * @returns Function to retrieve the mocked generic object with the corresponding id.
 */
function GetObjectMock(genericObjects = []) {
  genericObjects.forEach(validate);
  const objectRegistry = new Registry(genericObjects, createMock);

  return (id) => Promise.resolve(objectRegistry.find(id));
}

export default GetObjectMock;
