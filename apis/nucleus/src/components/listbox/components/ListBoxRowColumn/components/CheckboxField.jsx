import React from 'react';
import { FormControlLabel } from '@mui/material';
import ListBoxCheckbox from './ListBoxCheckbox';
import ListBoxRadioButton from './ListBoxRadioButton';
import { isExcluded } from '../helpers/cell-states';
import classes from '../helpers/classes';
import LabelTag from './LabelTag';

function CheckboxField({
  label,
  color,
  qElemNumber,
  isSelected,
  dense,
  cell,
  isGridCol,
  showGray,
  isSingleSelect,
  highlighted,
  checkboxes,
  valueTextAlign,
}) {
  const cb = (
    <ListBoxCheckbox
      label={label}
      checked={isSelected}
      dense={dense}
      excluded={isExcluded(cell)}
      isGridCol={isGridCol}
      showGray={showGray}
    />
  );
  const rb = <ListBoxRadioButton label={label} checked={isSelected} dense={dense} />;

  return (
    <FormControlLabel
      color={color}
      control={isSingleSelect ? rb : cb}
      className={classes.checkboxLabel}
      label={
        <LabelTag
          label={label}
          color={color}
          highlighted={highlighted}
          dense={dense}
          showGray={showGray}
          checkboxes={checkboxes}
          cell={cell}
          valueTextAlign={valueTextAlign}
        />
      }
      key={qElemNumber}
    />
  );
}

export default React.memo(
  CheckboxField,
  (o, n) =>
    o.label === n.label &&
    o.color === n.color &&
    o.qElemNumber === n.qElemNumber &&
    o.isSelected === n.isSelected &&
    o.dense === n.dense &&
    o.cell === n.cell &&
    o.isGridCol === n.isGridCol &&
    o.showGray === n.showGray &&
    o.isSingleSelect === n.isSingleSelect &&
    o.highlighted === n.highlighted &&
    o.checkboxes === n.checkboxes &&
    o.valueTextAlign === n.valueTextAlign
);
