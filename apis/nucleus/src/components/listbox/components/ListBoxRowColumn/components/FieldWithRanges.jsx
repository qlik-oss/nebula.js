import React from 'react';
import CheckboxField from './CheckboxField';
import ValueField from './ValueField';
import classes from '../helpers/classes';

function LabelsWithRanges({ labels, dense, showGray, checkboxes }) {
  const text = labels.map(([label, highlighted], index) => (
    <span id={index} className={highlighted ? classes.highlighted : ''}>
      {label}
    </span>
  ));
  return <ValueField label={text} dense={dense} showGray={showGray} checkboxes={checkboxes} />;
}

function FieldWithRanges({
  onChange,
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
      onChange={onChange}
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

export default FieldWithRanges;
