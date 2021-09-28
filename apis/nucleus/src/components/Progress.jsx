/* eslint react/jsx-props-no-spreading: 0 */

import React from 'react';

import { CircularProgress } from '@mui/material';

const SIZES = {
  small: 16,
  medium: 32,
  large: 64,
  xlarge: 128,
};

export default function Progress({ size = 'medium', ...props }) {
  const s = SIZES[size];

  return (
    <div sx={{ position: 'relative', display: 'inline-block' }}>
      <CircularProgress variant="determinate" value={100} sx={{ color: 'divider' }} size={s} thickness={3} {...props} />
      <CircularProgress
        variant="indeterminate"
        sx={{ color: 'secondary.main', animationDuration: '1500ms', position: 'absolute', left: 0 }}
        disableShrink
        size={s}
        thickness={3}
        {...props}
      />
    </div>
  );
}
