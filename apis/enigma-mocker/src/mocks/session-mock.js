function SessionMock() {
  return {
    getObjectApi() {
      return Promise.resolve({
        id: `sessapi - ${+Date.now()}`,
      });
    },
  };
}

export default SessionMock;
