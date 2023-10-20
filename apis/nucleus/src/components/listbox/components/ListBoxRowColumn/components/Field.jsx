import React from 'react';
import CheckboxField from './CheckboxField';
import ValueField from './ValueField';

function Field({
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
  return checkboxes ? (
    <CheckboxField
      onChange={onChange}
      label={label}
      qElemNumber={qElemNumber}
      isSelected={isSelected}
      dense={dense}
      cell={cell}
      isGridCol={isGridCol}
      showGray={showGray}
      isSingleSelect={isSingleSelect}
      checkboxes={checkboxes}
      valueTextAlign={valueTextAlign}
      styles={styles}
    />
  ) : (
    <ValueField
      label={label}
      dense={dense}
      showGray
      checkboxes={checkboxes}
      cell={cell}
      valueTextAlign={valueTextAlign}
    />
  );
}

export default React.memo(Field);
