import { styled } from '@mui/material';
import React from 'react';

const StyledBorder = styled('div')(({ theme, width, height }) => ({
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 1,
  width,
  height,
  boxShadow: `inset 0 0 0 2px ${theme.palette.custom.focusBorder}`,
}));

export default function ListBoxFocusBorder({ show, width, height }) {
  if (!show) {
    return null;
  }

  return <StyledBorder aria-hidden="true" width={width} height={height} />;
}
