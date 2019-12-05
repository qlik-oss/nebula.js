/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Grid } from '@material-ui/core';

import Progress from './Progress';

export default function Loading() {
  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justify="center"
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
      }}
      spacing={2}
    >
      <Progress size="large" />
    </Grid>
  );
}
