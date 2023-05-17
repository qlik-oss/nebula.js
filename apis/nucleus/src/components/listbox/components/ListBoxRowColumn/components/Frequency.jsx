import React from 'react';
import { Grid, Typography } from '@mui/material';
import { excludedOrAlternative } from '../helpers/cell-states';
import classes from '../helpers/classes';
import { getFrequencyText, joinClassNames } from '../helpers/operations';

function Frequency({ cell, checkboxes, dense, showGray }) {
  const frequencyText = getFrequencyText(cell?.qFrequency);
  return (
    <Grid
      item
      style={{ display: 'flex', alignItems: 'center' }}
      className={classes.frequencyCount}
      aria-label={frequencyText}
      title={frequencyText}
    >
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
        {frequencyText}
      </Typography>
    </Grid>
  );
}

export default Frequency;
