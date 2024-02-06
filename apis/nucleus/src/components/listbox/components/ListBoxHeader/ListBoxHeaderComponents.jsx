import React from 'react';
import { styled } from '@mui/material/styles';
import { ButtonBase, CircularProgress, Grid, Typography } from '@mui/material';
import Lock from '@nebula.js/ui/icons/lock';
import { ICON_PADDING } from '../../constants';

export const iconStyle = {
  fontSize: '12px',
};

export const UnlockButton = styled(ButtonBase)(({ theme, isLoading }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  height: 48,
  zIndex: 2, // so it goes on top of action buttons
  background: theme.palette.custom.disabledBackground,
  opacity: 1,
  color: theme.palette.custom.disabledContrastText,
  width: '100%',
  display: 'flex',
  justifyContent: isLoading ? 'center' : 'flex-start',
  paddingLeft: 16,
  paddingRight: 16,
  borderRadius: 0,
  '& *, & p': {
    color: theme.palette.custom.disabledContrastText,
  },
  '& i': {
    padding: `${ICON_PADDING}px`,
  },
}));

export const StyledGridHeader = styled(Grid, { shouldForwardProp: (p) => !['styles', 'isRtl'].includes(p) })(
  ({ styles, isRtl }) => ({
    flexDirection: isRtl ? 'row-reverse' : 'row',
    wrap: 'nowrap',
    minHeight: 32,
    alignContent: 'center',
    ...styles.header,
    '& *': {
      color: styles.header.color,
    },
  })
);

export const HeaderTitle = styled(Typography)(({ styles }) => ({
  ...styles.header,
  display: 'block', // needed for text-overflow to work
  alignItems: 'center',
  paddingRight: '1px', // make place for italic font style
}));

export function UnlockCoverButton({ translator, toggleLock, keyboard, isLoading }) {
  const fontSize = '14px';
  const unLockText = translator.get('SelectionToolbar.ClickToUnlock');
  const component = (
    <UnlockButton
      title={unLockText}
      tabIndex={keyboard.enabled ? 0 : -1}
      onClick={toggleLock}
      data-testid="listbox-unlock-button"
      id="listbox-unlock-button"
      isLoading={isLoading}
    >
      {isLoading ? (
        <CircularProgress size={16} variant="indeterminate" color="primary" />
      ) : (
        <Lock disableRipple style={iconStyle} />
      )}
      {!isLoading && <Typography fontSize={fontSize}>{unLockText}</Typography>}
    </UnlockButton>
  );
  return component;
}
