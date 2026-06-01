import { styled } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

const StyledBorder = styled('div')(({ theme, width, height }) => ({
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 1,
  width,
  height,
  boxShadow: `inset 0 0 0 2px ${theme.palette.custom.focusBorder}`,
}));

export default function ListBoxFocusBorder({ width, height, disabled, childNode, containerNode }) {
  const [isOnlyContainerFocused, setIsOnlyContainerFocused] = useState(false);

  const checkFocus = useCallback(() => {
    const containerFocused = containerNode && containerNode.contains(document.activeElement);
    const childFocused = childNode && childNode.contains(document.activeElement);
    setIsOnlyContainerFocused(containerFocused && !childFocused);
  }, [containerNode, childNode]);

  useEffect(() => {
    if (!containerNode) {
      return undefined;
    }
    containerNode.addEventListener('focusin', checkFocus);
    containerNode.addEventListener('focusout', checkFocus);

    checkFocus();

    return () => {
      containerNode.removeEventListener('focusin', checkFocus);
      containerNode.removeEventListener('focusout', checkFocus);
    };
  }, [checkFocus, containerNode]);

  const show = !disabled && isOnlyContainerFocused;
  if (!show) {
    return null;
  }

  return <StyledBorder aria-hidden="true" width={width} height={height} />;
}
