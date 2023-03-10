import React from 'react';
import CheckboxField from './CheckboxField';
import ValueField from './ValueField';

function Field({
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
  return checkboxes ? (
    <CheckboxField
      label={label}
      color={color}
      qElemNumber={qElemNumber}
      isSelected={isSelected}
      dense={dense}
      cell={cell}
      isGridCol={isGridCol}
      showGray={showGray}
      isSingleSelect={isSingleSelect}
      highlighted={highlighted}
      checkboxes={checkboxes}
      valueTextAlign={valueTextAlign}
    />
  ) : (
    <ValueField
      label={label}
      color={color}
      highlighted={false}
      dense={dense}
      showGray
      checkboxes={checkboxes}
      cell={cell}
      valueTextAlign={valueTextAlign}
    />
  );
}

export default React.memo(
  Field,
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
