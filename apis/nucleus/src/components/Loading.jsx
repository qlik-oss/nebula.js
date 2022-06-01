/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Grid } from '@mui/material';

import Progress from './Progress';

export default function Loading() {
  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
      }}
      gap={2}
    >
      <Progress size="large" />
    </Grid>
  );
}
