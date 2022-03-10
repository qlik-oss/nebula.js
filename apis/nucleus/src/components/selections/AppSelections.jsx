import React from 'react';
import ReactDOM from 'react-dom';

import { Grid } from '@material-ui/core';

import { useTheme } from '@nebula.js/ui/theme';

import SelectedFields from './SelectedFields';
import Nav from './Nav';
import useAppSelections from '../../hooks/useAppSelections';

function AppSelections({ app }) {
  const theme = useTheme();
  const [appSelections] = useAppSelections(app);
  if (!appSelections) return null;
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
        <Nav api={appSelections} app={app} />
      </Grid>
      <Grid item xs style={{ backgroundColor: theme.palette.background.darker, overflow: 'hidden' }}>
        <SelectedFields api={appSelections} app={app} />
      </Grid>
    </Grid>
  );
}

export { AppSelections };

export default function mount({ element, app }) {
  return ReactDOM.createPortal(<AppSelections app={app} />, element);
}
