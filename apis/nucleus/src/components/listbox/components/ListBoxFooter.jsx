import { IconButton, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import React from 'react';
import ListBoxDisclaimer from './ListBoxDisclaimer';

const RootContainer = styled(Paper)(({ theme, left }) => ({
  position: 'absolute',
  bottom: '12px',
  display: 'flex',
  border: `1px solid ${theme.palette.divider}`,
  width: 'calc(100% - 11px)',
  left,
}));

const LeftItem = styled('div')(() => ({
  paddingLeft: '6px',
  flexGrow: 1,
}));

const RightItem = styled('div')(({ dense }) => ({
  display: 'flex',
  alignItems: `${dense ? 'center' : 'flex-start'}`,
}));

const SmallCloseIcon = styled(CloseIcon)(() => ({
  fontSize: '14px',
}));

export default function ListBoxFooter({ text, dismiss, dense, parentWidth = 0 }) {
  const hasDismissButton = typeof dismiss === 'function';
  const maxWidth = dense ? 370 : 282;
  const left = Math.max(parentWidth / 2 - maxWidth / 2, 0);
  const textWidth = Math.min(maxWidth, parentWidth) - 42;
  const enableTooltip = dense && parentWidth < maxWidth;

  return (
    <RootContainer left={left} style={{ maxWidth }}>
      <LeftItem>
        <ListBoxDisclaimer text={text} dense={dense} width={textWidth} tooltip={enableTooltip} />
      </LeftItem>
      <RightItem dense={dense}>
        {hasDismissButton && (
          <IconButton aria-label="close" onClick={() => dismiss()}>
            <SmallCloseIcon />
          </IconButton>
        )}
      </RightItem>
    </RootContainer>
  );
}
