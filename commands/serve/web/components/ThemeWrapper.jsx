import React, { useMemo } from 'react';
import { createTheme, ThemeProvider, StyledEngineProvider } from '@nebula.js/ui/theme';

export const ThemeWrapper = ({ themeName, children }) => {
  // this theme will be created only once
  const theme = useMemo(() => {
    return createTheme(themeName);
  }, [themeName]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </StyledEngineProvider>
  );
};
