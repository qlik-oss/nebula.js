import { getPropValue, getPropFn } from '../prop';

/**
 * Properties on `getObject()` operating synchronously.
 * @ignore
 * @type Array
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
 * @ignore
 * @returns `true` if property is operating asynchrously, otherwise `false`.
 */
function isPropAsync(name) {
  return !PROPS_SYNC.includes(name);
}

/**
 * Get `qId` for visualization.
 * @param {object} genericObject Generic object describing behaviour of mock
 * @ignore
 * @returns The `qId`, undefined if not present
 */
function getQId(genericObject) {
  const layout = getPropValue(genericObject.getLayout);
  return layout.qInfo && layout.qInfo.qId;
}

/**
 * Create a mock of a generic object. Mandatory properties are added, functions returns async values where applicable etc.
 * @param {object} genericObject Generic object describing behaviour of mock
 * @param {EnigmaMockerOptions} options Options.
 * @ignore
 * @returns The mocked object
 */
function createMock(genericObject, options) {
  let qId = getQId(genericObject);
  const { delay } = options;
  const { id, session, ...props } = genericObject;

  if (id && qId && id !== qId) {
    throw new Error(`Generic object has multiple IDs, qInfo.qId: ${qId}, id: ${id}`);
  }

  qId = qId || id || `object - ${+Date.now()}`;

  const mock = {
    id: qId,
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
  return { [qId]: mock };
}

/**
 * Create mocked objects from list of generic objects.
 * @param {Array<object>} genericObjects Generic objects describing behaviour of mock
 * @param {EnigmaMockerOptions} options options
 * @ignore
 * @returns Object with mocks where key is `qId` and value is the mocked object.
 */
function createMocks(genericObjects, options) {
  return genericObjects.reduce(
    (mocks, genericObject) => ({
      ...mocks,
      ...createMock(genericObject, options),
    }),
    {}
  );
}

/**
 * Validates if mandatory information is available.
 * @param {object} genericObject Generic object to validate
 * @ignore
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
  const qId = getQId(genericObject);
  if (!qId) {
    throw new Error('Generic object is missing "qId" for path "getLayout().qInfo.qId"');
  }
}

/**
 * Creates mock of `getObject(id)` based on an array of generic objects.
 * @param {Array<object>} genericObjects Generic objects.
 * @param {EnigmaMockerOptions} options Options.
 * @ignore
 * @returns Function to retrieve the mocked generic object with the corresponding id.
 */
function GetObjectMock(genericObjects = [], options = {}) {
  if (!Array.isArray(genericObjects) || genericObjects.length === 0) {
    return () => {
      throw new Error('No "genericObjects" specified');
    };
  }

  genericObjects.forEach(validate);
  const mocks = createMocks(genericObjects, options);

  return async (id) => Promise.resolve(mocks[id]);
}

export default GetObjectMock;
