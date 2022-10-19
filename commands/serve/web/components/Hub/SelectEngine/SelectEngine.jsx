import React, { useState } from 'react';
import { Help } from '@nebula.js/ui/icons';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import ConnectionOptions from './ConnectionOptions';
import ConnectionGuid from './ConnectionGuid';
import ConnectionHistory from './ConnectionHistory';
import storageFn from '../../../storage';

const storage = storageFn({});

const SelectEngine = ({ info, error }) => {
  const [items, setItems] = useState(storage.get('connections') || []);
  const [showInstructions, setShowInstructions] = useState(!items.length);
  const [goTo] = useState(() => (u) => `${window.location.origin}?engine_url=${u.replace('?', '&')}`);

  const onRemove = (li) => {
    const idx = items.indexOf(li);
    if (li !== -1) {
      const its = items.slice();
      its.splice(idx, 1);
      storage.save('connections', its);
      setItems(its);
    }
  };

  const onKeyDown = (val) => {
    window.location.href = goTo(val);
  };

  return (
    <>
      <Grid container>
        <Grid item xs>
          <Typography variant="h5" gutterBottom>
            Connect to an engine
          </Typography>
        </Grid>
        <Grid item>
          <IconButton onClick={() => setShowInstructions((s) => !s)} size="small">
            <Help />
          </IconButton>
        </Grid>
      </Grid>

      <ConnectionHistory items={items} onRemove={onRemove} goTo={goTo} />

      <Typography variant="h6" gutterBottom>
        New connection with:
      </Typography>
      <ConnectionOptions info={info} onKeyDown={onKeyDown} error={error} />

      <ConnectionGuid showInstructions={showInstructions} />
    </>
  );
};

export default SelectEngine;
