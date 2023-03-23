import React from 'react';
import CheckboxField from './CheckboxField';
import ValueField from './ValueField';

function LabelsWithRanges({ labels, dense, showGray, checkboxes, textDirection }) {
  return (
    <div dir={textDirection}>
      {labels.map(([label, highlighted], index) => {
        const key = `${index}`;
        return (
          <ValueField
            label={label}
            key={key}
            highlighted={highlighted}
            dense={dense}
            showGray={showGray}
            checkboxes={checkboxes}
          />
        );
      })}
    </div>
  );
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
  textDirection,
}) {
  const LWR = (
    <LabelsWithRanges
      labels={labels}
      dense={dense}
      showGray={showGray}
      checkboxes={checkboxes}
      textDirection={textDirection}
    />
  );
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
