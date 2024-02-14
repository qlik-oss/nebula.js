import React, { useState, useEffect } from 'react';
import { Help } from '@nebula.js/ui/icons';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import ConnectionGuid from './ConnectionGuid';
import ConnectionHistory from './ConnectionHistory';
import ConnectionOptions from './ConnectionOptions';
import { ContentWrapper } from '../styles';
import { useRootContext } from '../../../contexts/RootContext';

const SelectEngine = () => {
  const { cachedConnectionsData } = useRootContext();
  const [showGuid, setShowGuid] = useState(false);

  useEffect(() => {
    setShowGuid(!cachedConnectionsData.cachedConnections.length);

    // DEAUTHORIZE PREVIOUS AUTHENTICATION
    const handleAuthCheck = async () => {
      // const { isAuthorized } = await (await fetch('/isAuthorized')).json();
      // console.log('[auth_check_selectEngine]: is AUTH', isAuthorized);
      // if (isAuthorized) {
      console.log('[auth_check_selectEngine]: DEAUTH EFFECT!');
      try {
        await (await fetch('/deauthorize')).json();
        console.log('[auth_check_selectEngine]: DEAUTH OK');
      } catch (error) {
        console.log('[auth_check_selectEngine]: DEAUTH ERROR', error);
      }
      // }
    };

    handleAuthCheck();
  }, [cachedConnectionsData.cachedConnections.length]);

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
