/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react';
import { makeStyles, Grid, Typography, Button } from '@material-ui/core';
import WarningTriangle from '@nebula.js/ui/icons/warning-triangle-2';
import InstanceContext from '../contexts/InstanceContext';

import Progress from './Progress';

const useStyles = makeStyles(() => ({
  stripes: {
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

export const Cancel = ({ cancel, translator, ...props }) => (
  <>
    <Grid container item direction="column" alignItems="center" spacing={2}>
      <Grid item>
        <Progress />
      </Grid>
      <Grid item>
        <Typography variant="h6" align="center">
          {translator.get('Object.Update.Active')}
        </Typography>
      </Grid>
    </Grid>
    <Grid item {...props}>
      <Button variant="contained" onClick={cancel}>
        {translator.get('Cancel')}
      </Button>
    </Grid>
  </>
);

export const Retry = ({ retry, translator, ...props }) => (
  <>
    <Grid item>
      <WarningTriangle style={{ fontSize: '38px' }} />
    </Grid>
    <Grid item>
      <Typography variant="h6" align="center">
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

export default function LongRunningQuery({ canCancel, canRetry, api }) {
  const { stripes, cancel, retry } = useStyles();
  const { translator } = useContext(InstanceContext);

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justify="center"
      className={stripes}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
      }}
      spacing={2}
    >
      {canCancel && <Cancel cancel={api.cancel} translator={translator} className={cancel} />}
      {canRetry && <Retry retry={api.retry} translator={translator} className={retry} />}
    </Grid>
  );
}
