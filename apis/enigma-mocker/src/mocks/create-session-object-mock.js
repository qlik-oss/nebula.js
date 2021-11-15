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

export default CreateSessionObjectMock;
