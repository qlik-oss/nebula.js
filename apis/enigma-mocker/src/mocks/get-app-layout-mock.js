function GetAppLayoutMock(options) {
  return () => Promise.resolve({ id: 'app-layout', qLocaleInfo: options?.appLocaleInfo });
}

export default GetAppLayoutMock;
