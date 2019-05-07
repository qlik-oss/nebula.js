import React, {
  useEffect,
  useState,
} from 'react';

import {
  IconButton,
  Grid,
} from '@nebula.js/ui/components';

import SelectionsBack from '@nebula.js/ui/icons/SelectionsBack';
import SelectionsForward from '@nebula.js/ui/icons/SelectionsForward';
import ClearSelections from '@nebula.js/ui/icons/ClearSelections';

export default function Nav({
  api,
}) {
  const [state, setState] = useState({
    forward: api.canGoForward(),
    back: api.canGoBack(),
    clear: api.canClear(),
  });

  useEffect(() => {
    if (!api) {
      return undefined;
    }
    const onChange = () => setState({
      forward: api.canGoForward(),
      back: api.canGoBack(),
      clear: api.canClear(),
    });
    api.on('changed', onChange);
    return () => {
      api.removeListener('changed', onChange);
    };
  }, [api]);

  return (
    <Grid
      container
      wrap="nowrap"
      style={{
        height: '100%',
        alignItems: 'center',
      }}
    >
      <Grid item>
        <IconButton
          style={{ marginRight: '8px' }}
          disabled={!state.back}
          onClick={() => api.back()}
        >
          <SelectionsBack />
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton
          style={{ marginRight: '8px' }}
          disabled={!state.forward}
          onClick={() => api.forward()}
        >
          <SelectionsForward />
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton
          disabled={!state.clear}
          onClick={() => api.clear()}
        >
          <ClearSelections />
        </IconButton>
      </Grid>
    </Grid>
  );
}
