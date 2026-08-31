import React from 'react';
import { render } from '@testing-library/react';
import userEvents from '@testing-library/user-event';
import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';

import { RootContext } from '../contexts/RootContext';

const theme = createTheme('light');

export function TestRenderer(component, contextValuesOverride) {
  const contextValue = {
    // context values
    storage: () => {},

    // useInfo result
    info: {},
    setInfo: () => {},

    // useConnection result
    glob: {},
    setGlobal: () => {},
    treatAsDesktop: false,
    setTreatAsDesktop: () => {},
    error: {},
    setError: () => {},
    activeStep: 0,
    setActiveStep: () => {},

    // useCachedConnections result
    cachedConnectionsData: {
      cachedConnections: [],
      addCachedConnections: () => {},
      removeCachedConnection: () => {},
    },

    // override what ever you want in render level
    ...contextValuesOverride,
  };

  const Wrapper = ({ children }) => (
    <RootContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </RootContext.Provider>
  );

  return { ...render(component, { wrapper: Wrapper }), userEvents: userEvents.setup() };
}

// Wrapper for tests that use routing context - in tests, BrowserRouter is mocked
export const RouterWrapper = ({ children }) => children;
