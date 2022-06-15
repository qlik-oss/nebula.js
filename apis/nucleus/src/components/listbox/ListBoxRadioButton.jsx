import React from 'react';
import { styled } from '@mui/material/styles';
import { Radio } from '@mui/material';

const PREFIX = 'ListBoxRadioButton';

const classes = {
  denseRadioButton: `${PREFIX}-denseRadioButton`,
  radioButton: `${PREFIX}-radioButton`,
};

const StyledRadio = styled(Radio)(() => ({
  [`& .${classes.denseRadioButton}`]: {
    height: '100%',
    boxSizing: 'border-box',
    '& svg': {
      width: '0.7em',
      height: '0.7em',
    },
  },

  [`& .${classes.radioButton}`]: {
    right: '5px',
  },
}));

export default function ListBoxRadioButton({ checked, label, dense }) {
  return (
    <StyledRadio
      checked={checked}
      value={label}
      name={label}
      inputProps={{ 'aria-labelledby': label }}
      className={dense ? classes.denseRadioButton : classes.radioButton}
      style={{ backgroundColor: 'transparent' }}
      disableRipple
    />
  );
}
