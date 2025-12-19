import React from 'react';
import { Typography } from '@mui/material';

function PinItem({ displayName }) {
  return (
    <Typography noWrap style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 600, marginTop: '8px' }}>
      {displayName}
    </Typography>
  );
}

export default PinItem;
