import React from 'react';
import { Grid, Typography } from '@mui/material';
import { excludedOrAlternative } from '../helpers/cell-states';
import classes from '../helpers/classes';
import { getFrequencyText, joinClassNames } from '../helpers/operations';

export default function Frequency({ cell, checkboxes, dense, showGray }) {
  return (
    <Grid item style={{ display: 'flex', alignItems: 'center' }} className={classes.frequencyCount}>
      <Typography
        noWrap
        color="inherit"
        variant="body2"
        className={joinClassNames([
          dense && classes.labelDense,
          classes.labelText,
          showGray && excludedOrAlternative({ cell, checkboxes }) && classes.excludedTextWithCheckbox,
        ])}
      >
        {getFrequencyText({ cell })}
      </Typography>
    </Grid>
  );
}
