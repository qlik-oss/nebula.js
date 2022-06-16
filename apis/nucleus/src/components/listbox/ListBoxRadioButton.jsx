import React from 'react';
import { styled } from '@mui/material/styles';
import { Radio } from '@mui/material';

const PREFIX = 'ListBoxRadioButton';

const classes = {
  denseRadioButton: `${PREFIX}-denseRadioButton`,
  radioButton: `${PREFIX}-radioButton`,
};

const StyledRadio = styled(Radio)(() => ({
  [`&.${classes.radioButton}`]: {
    right: '5px',
  },
}));

export default function ListBoxRadioButton({ checked, label, dense }) {
  return (
    <StyledRadio
      checked={checked}
      value={label}
      name={label}
      className={classes.radioButton}
      style={{ backgroundColor: 'transparent' }}
      disableRipple
      size={dense ? 'small' : 'medium'}
      sx={dense && { padding: '0px', paddingLeft: '6px' }}
    />
  );
}
