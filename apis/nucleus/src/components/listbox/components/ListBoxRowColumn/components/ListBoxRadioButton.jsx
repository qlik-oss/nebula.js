import React from 'react';
import { styled } from '@mui/material/styles';
import { Radio } from '@mui/material';

const PREFIX = 'ListBoxRadioButton';

const classes = {
  denseRadioButton: `${PREFIX}-denseRadioButton`,
  radioButton: `${PREFIX}-radioButton`,
};

const StyledRadio = styled(Radio)(({ theme, checked }) => ({
  [`&.${classes.radioButton}`]: {
    right: '5px',
    color: checked ? theme.palette.selected.main : theme.palette.main,
  },
}));

export default function ListBoxRadioButton({ onChange, checked, label, dense, dataN }) {
  return (
    <StyledRadio
      checked={checked}
      onChange={onChange}
      value={label}
      name={label}
      className={classes.radioButton}
      inputProps={{ 'data-n': dataN }}
      style={{ backgroundColor: 'transparent' }}
      disableRipple
      size={dense ? 'small' : 'medium'}
      sx={dense && { padding: '0px 0px 0px 12px' }}
    />
  );
}
