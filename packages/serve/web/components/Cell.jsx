import React from 'react';

import {
  Grid,
  Card,
} from '@nebula.js/ui/components';

import Chart from './Chart';

export default function ({
  object,
  onSelected,
}) {
  return (
    <Card style={{ minHeight: 400, position: 'relative', overflow: 'visible' }}>
      <Grid
        container
        style={{
          position: 'absolute',
          height: '100%',
        }}
      >
        <Grid item xs={12}>
          <Chart id={object.qInfo.qId} onSelected={onSelected} />
        </Grid>
      </Grid>
    </Card>
  );
}
