import React from 'react';
import { Button, styled } from '@mui/material';
import { ICON_PADDING } from '../../constants';

const StyledButton = styled(Button)(() => ({
  borderRadius: 4,
  width: 24,
  height: 24,
  minWidth: 22,
  padding: 0,
}));

function DimensionIcon({ iconData, translator, iconStyle, disabled, keyboard }) {
  if (!iconData) return undefined;

  const { icon, tooltip, onClick = undefined, onKeyDown = undefined } = iconData;
  const Icon = icon;
  const title = translator.get(tooltip);
  const isButton = onClick;

  return isButton ? (
    <StyledButton
      variant="outlined"
      onClick={onClick}
      tabIndex={keyboard.innerTabStops ? 0 : -1}
      title={title}
      size="large"
      disableRipple
      disabled={disabled}
      onKeyDown={onKeyDown}
      className="listbox-cyclic-button"
      data-testid="listbox-cyclic-button"
    >
      <Icon style={iconStyle} />
    </StyledButton>
  ) : (
    <Icon title={title} size="large" style={{ ...iconStyle, padding: `${ICON_PADDING}px` }} />
  );
}
export default DimensionIcon;
