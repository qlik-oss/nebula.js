import React from 'react';
import { styled } from '@mui/material/styles';
import { Radio } from '@mui/material';

const PREFIX = 'ListBoxRadioButton';

const classes = {
  radioButton: `${PREFIX}-radioButton`,
};

const StyledRadio = styled(Radio, { shouldForwardProp: (p) => !['dense', 'styles'].includes(p) })(
  ({ checked, styles, dense }) => ({
    [`&.${classes.radioButton}`]: {
      right: '5px',
      color: checked ? styles.selections.selected : styles.content.color,
      padding: dense ? '0px 0px 0px 12px' : undefined,
      backgroundColor: 'transparent',
    },
  })
);

export default function ListBoxRadioButton({ onChange, checked, label, dense, dataN, styles }) {
  return (
    <StyledRadio
      checked={checked}
      onChange={onChange}
      value={label}
      name={label}
      className={classes.radioButton}
      inputProps={{ 'data-n': dataN }}
      disableRipple
      size={dense ? 'small' : 'medium'}
      dense={dense}
      styles={styles}
    />
  );
}
