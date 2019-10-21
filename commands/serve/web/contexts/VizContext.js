import React from 'react';

const VizContext = React.createContext({
  currentThemeName: null,
  activeViz: null,
  setActiveViz: () => {},
  expandedObject: null,
  setExpandedObject: () => {},
});

export default VizContext;
