import React from 'react';
import { FormControlLabel } from '@mui/material';
import ListBoxCheckbox from './ListBoxCheckbox';
import ListBoxRadioButton from './ListBoxRadioButton';
import { isExcluded } from '../helpers/cell-states';
import classes from '../helpers/classes';
import LabelTag from './LabelTag';

function CheckboxField({
  onChange,
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
      onChange={onChange}
      label={label}
      checked={isSelected}
      dense={dense}
      excluded={isExcluded(cell)}
      isGridCol={isGridCol}
      showGray={showGray}
      dataN={qElemNumber}
    />
  );
  const rb = (
    <ListBoxRadioButton onChange={onChange} label={label} checked={isSelected} dense={dense} dataN={qElemNumber} />
  );

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

export default CheckboxField;
