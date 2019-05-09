import React from 'react';
import ReactDOM from 'react-dom';

import {
  Grid,
} from '@nebula.js/ui/components';

import {
  useTheme,
} from '@nebula.js/ui/theme';

import SelectedFields from './SelectedFields';
import Nav from './Nav';

export function AppSelections({
  api,
}) {
  const theme = useTheme();

  return (
    <Grid
      container
      spacing={0}
      wrap="nowrap"
      style={{
        backgroundColor: theme.palette.background.paper,
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
      <Grid item xs style={{ backgroundColor: theme.palette.background.darker, overflow: 'hidden' }}>
        <SelectedFields api={api} />
      </Grid>
    </Grid>
  );
}

export default function mount({
  element,
  api,
}) {
  return ReactDOM.createPortal(
    <AppSelections
      api={api}
    />,
    element,
  );
}
