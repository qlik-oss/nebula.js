import React from 'react';
import { makeStyles, Grid, Typography } from '@material-ui/core';
import WarningTriangle from '@nebula.js/ui/icons/warning-triangle-2';

const useStyles = makeStyles(() => ({
  container: {
    height: '100%',
  },
}));

const Component = ({ Title = 'Error', err = { message: '' }, dataErrors }) => {
  const { container } = useStyles();
  return (
    <Grid container direction="column" alignItems="center" justify="center" className={container} spacing={1}>
      <Grid item>
        <WarningTriangle style={{ fontSize: '48px' }} />
      </Grid>
      <Grid item>
        <Typography variant="h4" align="center">
          {Title}
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="h6" align="center">
          {err.message}
        </Typography>
      </Grid>
      <Grid item>
        {dataErrors.map((e, ix) => (
          // eslint-disable-next-line react/no-array-index-key
          <Typography key={ix} variant="h6" align="center">
            {e.qErrorCode}
          </Typography>
        ))}
      </Grid>
    </Grid>
  );
};

export default Component;
