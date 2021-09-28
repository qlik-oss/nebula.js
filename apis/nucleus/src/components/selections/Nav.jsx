import React, { useContext } from 'react';

import { IconButton, Grid } from '@mui/material';

import SelectionsBack from '@nebula.js/ui/icons/selections-back';
import SelectionsForward from '@nebula.js/ui/icons/selections-forward';
import ClearSelections from '@nebula.js/ui/icons/clear-selections';

import InstanceContext from '../../contexts/InstanceContext';
import useAppSelectionsNavigation from '../../hooks/useAppSelectionsNavigation';

export default function Nav({ api, app }) {
  const { translator } = useContext(InstanceContext);
  const [navState] = useAppSelectionsNavigation(app);

  return (
    <Grid
      container
      wrap="nowrap"
      style={{
        height: '100%',
        alignItems: 'center',
        padding: '0 8px',
      }}
    >
      <Grid item>
        <IconButton
          style={{ marginRight: '8px' }}
          disabled={!navState || !navState.canGoBack}
          title={translator.get('Navigate.Back')}
          onClick={() => api.back()}
          size="large">
          <SelectionsBack />
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton
          style={{ marginRight: '8px' }}
          disabled={!navState || !navState.canGoForward}
          title={translator.get('Navigate.Forward')}
          onClick={() => api.forward()}
          size="large">
          <SelectionsForward />
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton
          disabled={!navState || !navState.canClear}
          title={translator.get('Selection.ClearAll')}
          onClick={() => api.clear()}
          size="large">
          <ClearSelections />
        </IconButton>
      </Grid>
    </Grid>
  );
}
