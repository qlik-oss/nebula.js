import React from 'react';
import { makeStyles, Grid, Typography } from '@material-ui/core';
import WarningTriangle from '@nebula.js/ui/icons/warning-triangle-2';

const useStyles = makeStyles(() => ({
  contentError: {
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

export default function Error({ title = 'Error', message = '', data = [] }) {
  const { contentError } = useStyles();
  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justify="center"
      className={contentError}
      style={{ position: 'relative', height: '100%' }}
      spacing={1}
    >
      <Grid item>
        <WarningTriangle style={{ fontSize: '38px' }} />
      </Grid>
      <Grid item>
        <Typography variant="h6" align="center">
          {title}
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="subtitle1" align="center">
          {message}
        </Typography>
      </Grid>
      <Grid item>
        {data.map((d, ix) => (
          // eslint-disable-next-line react/no-array-index-key
          <Typography key={ix} variant="subtitle2" align="center">
            {d.path} {d.error && '-'} {d.error && d.error.qErrorCode}
          </Typography>
        ))}
      </Grid>
    </Grid>
  );
}
