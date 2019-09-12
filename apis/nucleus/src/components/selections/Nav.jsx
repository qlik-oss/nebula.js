import React, { useEffect, useState, useContext } from 'react';

import { IconButton, Grid } from '@nebula.js/ui/components';

import SelectionsBack from '@nebula.js/ui/icons/selections-back';
import SelectionsForward from '@nebula.js/ui/icons/selections-forward';
import ClearSelections from '@nebula.js/ui/icons/clear-selections';

import LocaleContext from '../../contexts/LocaleContext';

export default function Nav({ api }) {
  const translator = useContext(LocaleContext);

  const [state, setState] = useState({
    forward: api.canGoForward(),
    back: api.canGoBack(),
    clear: api.canClear(),
  });

  useEffect(() => {
    if (!api) {
      return undefined;
    }
    const onChange = () =>
      setState({
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
        padding: '0 8px',
      }}
    >
      <Grid item>
        <IconButton
          style={{ marginRight: '8px' }}
          disabled={!state.back}
          title={translator.get('Navigate.Back')}
          onClick={() => api.back()}
        >
          <SelectionsBack />
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton
          style={{ marginRight: '8px' }}
          disabled={!state.forward}
          title={translator.get('Navigate.Forward')}
          onClick={() => api.forward()}
        >
          <SelectionsForward />
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton disabled={!state.clear} title={translator.get('Selection.ClearAll')} onClick={() => api.clear()}>
          <ClearSelections />
        </IconButton>
      </Grid>
    </Grid>
  );
}
