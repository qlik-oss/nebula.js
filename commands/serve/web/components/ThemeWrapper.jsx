import React, { useMemo } from 'react';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider, StyledEngineProvider } from '@nebula.js/ui/theme';

export const ThemeWrapper = ({ themeName, children }) => {
  const theme = useMemo(() => {
    return createTheme(themeName);
  }, [themeName]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <Container maxWidth="md">{children}</Container>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};
