/* eslint-disable no-underscore-dangle */
import extend from 'extend';

// To cover test
const crt = global.crypto || { getRandomValues: () => 123456 };

// https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
// Not using crypto.randomUUID due to missing safari support < 15
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crt.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
}

function CreateSessionObjectMock() {
  return (props) => {
    props = props || {}; // eslint-disable-line no-param-reassign
    props.qInfo = props.qInfo || {}; // eslint-disable-line no-param-reassign
    props.qInfo.qId = props.qInfo.qId || `mock-${uuidv4()}`; // eslint-disable-line no-param-reassign

    const mockedInclusions = props._mock;
    let layout = props;

    if (mockedInclusions) {
      delete props._mock; // eslint-disable-line no-param-reassign
      layout = extend({}, props, mockedInclusions);
    }
    return Promise.resolve({
      on: () => {},
      once: () => {},
      getLayout: () => Promise.resolve(layout),
      getProperties: () => Promise.resolve(props),
      getEffectiveProperties: () => Promise.resolve(props),
      id: props.qInfo.qId,
      ...props,
    });
  };
}

export default CreateSessionObjectMock;
