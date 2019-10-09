import React from 'react';

const VizContext = React.createContext({
  activeViz: null,
  setActiveViz: () => {},
  expandedObject: null,
  setExpandedObject: () => {},
});

export default VizContext;
