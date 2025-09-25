import { styled } from '@mui/material';
import React from 'react';

const StyledBorder = styled('div')(({ theme, width, height }) => ({
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 1,
  width,
  height,
  boxShadow: `2px -2px 0px ${theme.palette.custom.focusBorder} inset, -2px -2px 0px ${theme.palette.custom.focusBorder}  inset`,
}));

export default function ListBoxFocusBorder({ show, width, height }) {
  if (!show) {
    return null;
  }

  return <StyledBorder width={width} height={height} />;
}
