import React from 'react';

export default React.createContext({
  language: null,
  theme: null,
  translator: null,
  constraints: {},
  interactions: {},
  themeApi: null,
  modelStore: {},
  selectionStore: {},
  hostConfig: null,
  queryParams: null,
});
