import React from 'react';
import { Typography } from '@mui/material';
import { joinClassNames } from '../helpers/operations';
import classes from '../helpers/classes';
import { excludedOrAlternative } from '../helpers/cell-states';

function ValueField({ label, dense, showGray = true, checkboxes, cell, valueTextAlign }) {
  return (
    <Typography
      component="span"
      variant="body2"
      className={joinClassNames([
        classes.labelText,
        dense && classes.labelDense,
        showGray && excludedOrAlternative({ cell, checkboxes }) && classes.excludedTextWithCheckbox,
      ])}
      align={valueTextAlign}
      dir="auto"
    >
      <span>{label}</span>
    </Typography>
  );
}

export default ValueField;
