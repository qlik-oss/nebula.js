import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { Radio } from '@mui/material';

const useStyles = makeStyles(() => ({
  denseRadioButton: {
    height: '100%',
    boxSizing: 'border-box',
    '& svg': {
      width: '0.7em',
      height: '0.7em',
    },
  },
  radioButton: {
    right: '5px',
  },
}));

export default function ListBoxRadioButton({ checked, label, dense }) {
  const styles = useStyles();

  return (
    <Radio
      checked={checked}
      value={label}
      name={label}
      inputProps={{ 'aria-labelledby': label }}
      className={dense ? styles.denseRadioButton : styles.radioButton}
      style={{ backgroundColor: 'transparent' }}
      disableRipple
    />
  );
}
