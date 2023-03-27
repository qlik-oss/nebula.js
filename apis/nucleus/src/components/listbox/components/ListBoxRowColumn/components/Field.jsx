import React from 'react';
import CheckboxField from './CheckboxField';
import ValueField from './ValueField';

function Field({
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
  checkboxes,
  valueTextAlign,
}) {
  return checkboxes ? (
    <CheckboxField
      onChange={onChange}
      label={label}
      color={color}
      qElemNumber={qElemNumber}
      isSelected={isSelected}
      dense={dense}
      cell={cell}
      isGridCol={isGridCol}
      showGray={showGray}
      isSingleSelect={isSingleSelect}
      checkboxes={checkboxes}
      valueTextAlign={valueTextAlign}
    />
  ) : (
    <ValueField
      label={label}
      color={color}
      dense={dense}
      showGray
      checkboxes={checkboxes}
      cell={cell}
      valueTextAlign={valueTextAlign}
    />
  );
}

export default React.memo(Field);
