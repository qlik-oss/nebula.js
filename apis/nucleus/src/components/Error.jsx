import React from 'react';
import { makeStyles, Grid, Typography } from '@material-ui/core';
import WarningTriangle from '@nebula.js/ui/icons/warning-triangle-2';

const useStyles = makeStyles(() => ({
  container: {
    height: '100%',
  },
}));

export default function Error({ title = 'Error', message = '', data = [] }) {
  const { container } = useStyles();
  return (
    <Grid container direction="column" alignItems="center" justify="center" className={container} spacing={1}>
      <Grid item>
        <WarningTriangle style={{ fontSize: '48px' }} />
      </Grid>
      <Grid item>
        <Typography variant="h4" align="center">
          {title}
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="h6" align="center">
          {message}
        </Typography>
      </Grid>
      <Grid item>
        {data.map((d, ix) => (
          // eslint-disable-next-line react/no-array-index-key
          <Typography key={ix} variant="h6" align="center">
            {d.path} - {d.error.qErrorCode}
          </Typography>
        ))}
      </Grid>
    </Grid>
  );
}
