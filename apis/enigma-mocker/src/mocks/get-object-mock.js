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

function isPropAsync(name) {
  return !PROPS_SYNC.includes(name);
}

function validate(object) {
  if (!object.getLayout) {
    throw new Error('Fixture is missing "getLayout" for path "getObject"');
  }
}

function GetObjectMock(objects) {
  objects.forEach(validate);

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

export default GetObjectMock;
