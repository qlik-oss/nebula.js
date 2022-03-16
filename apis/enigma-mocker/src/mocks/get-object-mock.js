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
  'qId',
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
 * Create a mock of a generic object. Mandatory properties are added, functions returns async values where applicable etc.
 * @param {object} genericObject Generic object describing behaviour of mock
 * @returns The mocked object
 */
function createMock(genericObject) {
  const { id, session, delay = 0, ...props } = genericObject;
  return {
    id: getPropValue(id, { defaultValue: `object - ${+Date.now()}` }),
    session: getPropValue(session, { defaultValue: true }),
    on: () => {},
    once: () => {},
    ...Object.entries(props).reduce(
      (fns, [name, value]) => ({
        ...fns,
        [name]: getPropFn(value, { async: isPropAsync(name), delay }),
      }),
      {}
    ),
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
  if (!(layout.qInfo && layout.qInfo.qId)) {
    throw new Error('Generic object is missing "qId" for path "getLayout().qInfo.qId"');
  }
  genericObject.qId = layout.qInfo.qId; // eslint-disable-line no-param-reassign
}

/**
 * Creates mock of `getObject(id)` based on an array of generic objects.
 * @param {Array<object>} genericObjects Generic objects.
 * @returns Function to retrieve the mocked generic object with the corresponding id.
 */
function GetObjectMock(genericObjects = []) {
  genericObjects.forEach(validate);
  const genericObjectMocks = genericObjects.map(createMock);

  return async (id) => {
    const mock = genericObjectMocks.find((m) => m.qId() === id);
    return Promise.resolve(mock);
  };
}

export default GetObjectMock;
