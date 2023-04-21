import React from 'react';
import { Typography } from '@mui/material';
import { joinClassNames } from '../helpers/operations';
import classes from '../helpers/classes';
import { excludedOrAlternative } from '../helpers/cell-states';

function ValueField({ label, color, dense, showGray = true, checkboxes, cell, valueTextAlign }) {
  return (
    <Typography
      component="span"
      variant="body2"
      className={joinClassNames([
        classes.labelText,
        dense && classes.labelDense,
        showGray && excludedOrAlternative({ cell, checkboxes }) && classes.excludedTextWithCheckbox,
      ])}
      color={color}
      align={valueTextAlign}
      dir="auto"
    >
      <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
    </Typography>
  );
}

export default ValueField;
