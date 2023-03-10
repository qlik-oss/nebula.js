import React from 'react';
import CheckboxField from './CheckboxField';
import ValueField from './ValueField';

function LabelsWithRanges({ labels, dense, showGray, checkboxes }) {
  return (
    <>
      {labels.map(([label, highlighted]) => (
        <ValueField
          label={label}
          key={label}
          highlighted={highlighted}
          dense={dense}
          showGray={showGray}
          checkboxes={checkboxes}
        />
      ))}
    </>
  );
}

function FieldWithRanges({
  labels,
  checkboxes,
  dense,
  showGray,
  color,
  qElemNumber,
  isSelected,
  cell,
  isGridCol,
  isSingleSelect,
  valueTextAlign,
}) {
  const LWR = <LabelsWithRanges labels={labels} dense={dense} showGray={showGray} checkboxes={checkboxes} />;
  return checkboxes ? (
    <CheckboxField
      label={LWR}
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
    LWR
  );
}

export default React.memo(
  FieldWithRanges,
  (o, n) =>
    o.labels === n.labels &&
    o.checkboxes === n.checkboxes &&
    o.dense === n.dense &&
    o.showGray === n.showGray &&
    o.color === n.color &&
    o.qElemNumber === n.qElemNumber &&
    o.isSelected === n.isSelected &&
    o.cell === n.cell &&
    o.isGridCol === n.isGridCol &&
    o.isSingleSelect === n.isSingleSelect &&
    o.valueTextAlign === n.valueTextAlign
);
