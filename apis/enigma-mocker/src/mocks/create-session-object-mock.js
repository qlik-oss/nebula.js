/* eslint-disable no-underscore-dangle */
import extend from 'extend';

function CreateSessionObjectMock() {
  return (props) => {
    const mockedInclusions = props ? props._mock : null;
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
      id: props && props.qInfo && props.qInfo.qId ? props.qInfo.qId : `sel - ${+Date.now()}`,
      ...props,
    });
  };
}

export default CreateSessionObjectMock;
