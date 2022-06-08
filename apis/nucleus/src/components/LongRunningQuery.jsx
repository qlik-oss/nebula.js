/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import { Grid, Typography, Button } from '@mui/material';
import WarningTriangle from '@nebula.js/ui/icons/warning-triangle-2';
import InstanceContext from '../contexts/InstanceContext';

import Progress from './Progress';

const PREFIX = 'LongRunningQuery';

const classes = {
  stripes: `${PREFIX}-stripes`,
};

const StyledGrid = styled(Grid)(() => ({
  [`& .${classes.stripes}`]: {
    '&::before': {
      position: 'absolute',
      height: '100%',
      width: '100%',
      top: 0,
      left: 0,
      content: '""',
      backgroundSize: '14.14px 14.14px',
      backgroundImage:
        'linear-gradient(135deg, currentColor 10%, rgba(0,0,0,0) 10%, rgba(0,0,0,0) 50%, currentColor 50%, currentColor 59%, rgba(0,0,0,0) 60%, rgba(0,0,0,0) 103%)',
      opacity: 0.1,
    },
  },
}));

export function Cancel({ cancel, translator, ...props }) {
  return (
    <>
      <StyledGrid container item direction="column" alignItems="center" gap={2}>
        <Grid item>
          <Progress />
        </Grid>
        <Grid item>
          <Typography variant="h6" align="center" data-tid="update-active">
            {translator.get('Object.Update.Active')}
          </Typography>
        </Grid>
      </StyledGrid>
      <Grid item {...props}>
        <Button variant="contained" onClick={cancel}>
          {translator.get('Cancel')}
        </Button>
      </Grid>
    </>
  );
}

export function Retry({ retry, translator, ...props }) {
  return (
    <>
      <Grid item>
        <WarningTriangle style={{ fontSize: '38px' }} />
      </Grid>
      <Grid item>
        <Typography variant="h6" align="center" data-tid="update-cancelled">
          {translator.get('Object.Update.Cancelled')}
        </Typography>
      </Grid>
      <Grid item>
        <Button variant="contained" onClick={retry} {...props}>
          {translator.get('Retry')}
        </Button>
      </Grid>
    </>
  );
}

export default function LongRunningQuery({ canCancel, canRetry, api }) {
  const { translator } = useContext(InstanceContext);

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      className={classes.stripes}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
      }}
      gap={2}
    >
      {canCancel && <Cancel cancel={api.cancel} translator={translator} className={classes.cancel} />}
      {canRetry && <Retry retry={api.retry} translator={translator} className={classes.retry} />}
    </Grid>
  );
}
