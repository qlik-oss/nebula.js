/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import { makeStyles, Grid, Typography, Button } from '@material-ui/core';
import WarningTriangle from '@nebula.js/ui/icons/warning-triangle-2';

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

const Cancel = ({ cancel, ...props }) => (
  <>
    <Grid item>
      <Typography variant="h4" align="center">
        Long running query...
      </Typography>
    </Grid>
    <Grid item {...props}>
      <Button variant="outlined" onClick={cancel}>
        Cancel
      </Button>
    </Grid>
  </>
);

const Retry = ({ retry, ...props }) => (
  <>
    <Grid item>
      <WarningTriangle style={{ fontSize: '38px' }} />
    </Grid>
    <Grid item>
      <Typography variant="h6" align="center">
        Data update was cancelled
      </Typography>
    </Grid>
    <Grid item>
      <Typography variant="subtitle1" align="center">
        Visualization not updated. Please try again.
      </Typography>
    </Grid>
    <Grid item>
      <Button variant="contained" onClick={retry} {...props}>
        Retry
      </Button>
    </Grid>
  </>
);

export default function LongRunningQuery({ onCancel, onRetry }) {
  const { stripes, cancel, retry } = useStyles();
  const [canCancel, setCanCancel] = useState(!!onCancel);
  const [canRetry, setCanRetry] = useState(!!onRetry);
  const handleCancel = () => {
    setCanCancel(false);
    setCanRetry(true);
    onCancel();
  };
  const handleRetry = () => {
    setCanRetry(false);
    setCanCancel(true);
    onRetry();
  };
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
      spacing={1}
    >
      {canCancel && <Cancel cancel={handleCancel} className={cancel} />}
      {canRetry && <Retry retry={handleRetry} className={retry} />}
    </Grid>
  );
}
