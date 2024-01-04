/* eslint-disable no-underscore-dangle */
import extend from 'extend';

// To cover test
// eslint-disable-next-line no-undef
const crt = globalThis.crypto || { getRandomValues: () => 123456 };

// https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
// Not using crypto.randomUUID due to missing safari support < 15
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crt.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
}

function CreateSessionObjectMock(session) {
  return (props) => {
    const properties = extend({}, props);
    properties.qInfo = properties.qInfo || {};
    properties.qInfo.qId = properties.qInfo.qId || `mock-${uuidv4()}`;

    const mockedInclusions = properties._mock;
    let layout = properties;

    if (mockedInclusions) {
      delete properties._mock;
      layout = extend({}, properties, mockedInclusions);
    }
    return Promise.resolve({
      on: () => {},
      once: () => {},
      getLayout: () => Promise.resolve(layout),
      getProperties: () => Promise.resolve(properties),
      getEffectiveProperties: () => Promise.resolve(properties),
      removeListener: () => {},
      id: properties.qInfo.qId,
      properties,
      session,
    });
  };
}

export default CreateSessionObjectMock;
