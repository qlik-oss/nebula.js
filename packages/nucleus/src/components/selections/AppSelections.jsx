import React, {
  useMemo,
} from 'react';
import ReactDOM from 'react-dom';

import {
  Grid,
} from '@nebula.js/ui/components';

import {
  createTheme,
  ThemeProvider,
  StylesProvider,
  createGenerateClassName,
} from '@nebula.js/ui/theme';

import SelectedFields from './SelectedFields';
import Nav from './Nav';

const generateClassName = createGenerateClassName({
  productionPrefix: 'sel-',
  disableGlobal: true,
  seed: 'nebula',
});

export function AppSelections({
  api,
}) {
  const theme = useMemo(() => createTheme(), []);

  return (
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider theme={theme}>
        <Grid
          container
          spacing={0}
          wrap="nowrap"
          style={{
            backgroundColor: '#fff',
            minHeight: '40px',
          }}
        >
          <Grid
            item
            style={{
              borderRight: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Nav api={api} />
          </Grid>
          <Grid item xs style={{ backgroundColor: '#E5E5E5', overflow: 'hidden' }}>
            <SelectedFields api={api} />
          </Grid>
        </Grid>
      </ThemeProvider>
    </StylesProvider>
  );
}

export default function mount({
  element,
  api,
}) {
  ReactDOM.render(
    <AppSelections
      api={api}
    />,
    element,
  );

  const unmount = () => {
    ReactDOM.unmountComponentAtNode(element);
  };

  return () => {
    unmount();
  };
}
