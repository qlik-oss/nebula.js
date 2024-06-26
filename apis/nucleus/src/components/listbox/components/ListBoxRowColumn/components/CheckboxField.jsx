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
  qElemNumber,
  isSelected,
  dense,
  cell,
  isGridCol,
  showGray,
  isSingleSelect,
  checkboxes,
  valueTextAlign,
  styles,
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
      styles={styles}
    />
  );
  const rb = (
    <ListBoxRadioButton
      onChange={onChange}
      label={label}
      checked={isSelected}
      dense={dense}
      dataN={qElemNumber}
      styles={styles}
    />
  );

  return (
    <FormControlLabel
      control={isSingleSelect ? rb : cb}
      className={classes.checkboxLabel}
      label={
        <LabelTag
          label={label}
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
