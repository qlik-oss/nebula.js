import React, { useState } from 'react';
import { Help } from '@nebula.js/ui/icons';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import ConnectionGuid from './ConnectionGuid';
import ConnectionHistory from './ConnectionHistory';
import ConnectionOptions from './ConnectionOptions';
import { ContentWrapper } from '../styles';

const SelectEngine = () => {
  const [showGuid, setShowGuid] = useState(false);

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

      <ConnectionHistory />
      <ConnectionOptions />
      <ConnectionGuid showGuid={showGuid} />
    </ContentWrapper>
  );
};

export default SelectEngine;
