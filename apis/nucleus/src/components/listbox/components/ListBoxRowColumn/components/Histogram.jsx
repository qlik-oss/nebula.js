import React from 'react';
import classes from '../helpers/classes';
import { frequencyTextNone } from '../helpers/constants';
import { getBarWidth, getFrequencyText, joinClassNames } from '../helpers/operations';

function Histogram({ cell, histogram, checkboxes, isSelected, frequencyMax }) {
  const hasHistogramBar = cell && histogram && getFrequencyText({ cell }) !== frequencyTextNone;
  if (!hasHistogramBar) {
    return undefined;
  }

  const width = getBarWidth({ qFrequency: cell.qFrequency, checkboxes, frequencyMax });
  return (
    <div
      className={joinClassNames([
        classes.bar,
        checkboxes && classes.barWithCheckbox,
        isSelected && (checkboxes ? classes.barSelectedWithCheckbox : classes.barSelected),
      ])}
      style={{ width }}
    />
  );
}

export default React.memo(
  Histogram,
  (o, n) =>
    o.cell === n.cell &&
    o.histogram === n.histogram &&
    o.checkboxes === n.checkboxes &&
    o.isSelected === n.isSelected &&
    o.frequencyMax === n.frequencyMax
);
