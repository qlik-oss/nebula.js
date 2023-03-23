import { Box } from '@mui/material';
import React from 'react';
import classes from '../helpers/classes';
import { frequencyTextNone } from '../../../constants';
import { getBarWidth, getFrequencyText, joinClassNames } from '../helpers/operations';

function Histogram({ qFrequency, histogram, checkboxes, isSelected, frequencyMax }) {
  const hasHistogramBar = qFrequency && histogram && getFrequencyText(qFrequency) !== frequencyTextNone;
  if (!hasHistogramBar) {
    return undefined;
  }

  const width = getBarWidth({ qFrequency, checkboxes, frequencyMax });
  return (
    <Box
      className={joinClassNames([
        classes.bar,
        checkboxes && classes.barWithCheckbox,
        isSelected && (checkboxes ? classes.barSelectedWithCheckbox : classes.barSelected),
      ])}
    >
      <Box className="bar-filled" width={width} />
    </Box>
  );
}

export default Histogram;
