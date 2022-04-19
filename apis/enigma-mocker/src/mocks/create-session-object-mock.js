/* eslint-disable no-underscore-dangle */
import extend from 'extend';

function CreateSessionObjectMock() {
  return (props) => {
    const mockedInclusions = props._mock;
    delete props._mock; // eslint-disable-line no-param-reassign
    const layout = mockedInclusions ? extend({}, props, mockedInclusions) : props;
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
