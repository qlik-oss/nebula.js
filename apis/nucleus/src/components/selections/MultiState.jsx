import React from 'react';

import {
  // IconButton,
  Grid,
  Typography,
} from '@nebula.js/ui/components';

export default function MultiState({ field }) {
  return (
    <Grid container spacing={0} alignItems="center" style={{ height: '100%', padding: '4px' }}>
      <Grid item style={{ minWidth: 0 }}>
        <Typography noWrap style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 600 }}>
          {field.name}
        </Typography>
      </Grid>
    </Grid>
  );
}
