import React from 'react';
import CheckboxField from './CheckboxField';
import ValueField from './ValueField';

function LabelsWithRanges({ labels, dense, showGray, checkboxes, direction }) {
  const orderedLabels = direction === 'rtl' ? [...labels].reverse() : labels;
  return (
    <>
      {orderedLabels.map(([label, highlighted], index) => {
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
    </>
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
  direction,
}) {
  const LWR = (
    <LabelsWithRanges labels={labels} dense={dense} showGray={showGray} checkboxes={checkboxes} direction={direction} />
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
