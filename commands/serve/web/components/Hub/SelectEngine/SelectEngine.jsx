import React, { useState, useMemo } from 'react';
import { Help } from '@nebula.js/ui/icons';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import ConnectionOptions from './ConnectionOptions';
import ConnectionGuid from './ConnectionGuid';
import ConnectionHistory from './ConnectionHistory';
import storageFn from '../../../storage';
import { ContentWrapper } from '../styles';

const SelectEngine = ({ info, error }) => {
  const storage = useMemo(() => storageFn({}), []);
  const [items, setItems] = useState(storage.get('connections') || []);
  const [showGuid, setShowGuid] = useState(!items.length);

  const onRemove = (li) => {
    const idx = items.indexOf(li);
    if (li !== -1) {
      const its = items.slice();
      its.splice(idx, 1);
      storage.save('connections', its);
      setItems(its);
    }
  };

  return (
    <ContentWrapper>
      <Grid container>
        <Grid item xs>
          <Typography variant="h5" gutterBottom>
            Connect to an engine
          </Typography>
        </Grid>
        <Grid item>
          <IconButton onClick={() => setShowGuid(!showGuid)} size="small">
            <Help />
          </IconButton>
        </Grid>
      </Grid>

      <ConnectionHistory items={items} onRemove={onRemove} />
      <ConnectionOptions info={info} error={error} />
      <ConnectionGuid showGuid={showGuid} />
    </ContentWrapper>
  );
};

export default SelectEngine;
