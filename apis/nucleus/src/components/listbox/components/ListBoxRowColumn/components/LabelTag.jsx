import React from 'react';
import ValueField from './ValueField';

function LabelTag({ label, color, highlighted, dense, showGray, checkboxes, cell, valueTextAlign }) {
  if (typeof label === 'string') {
    return (
      <ValueField
        label={label}
        color={color}
        highlighted={highlighted}
        dense={dense}
        showGray={showGray}
        checkboxes={checkboxes}
        cell={cell}
        valueTextAlign={valueTextAlign}
      />
    );
  }
  return label;
}

export default React.memo(
  LabelTag,
  (o, n) =>
    o.label === n.label &&
    o.color === n.color &&
    o.highlighted === n.highlighted &&
    o.dense === n.dense &&
    o.showGray === n.showGray &&
    o.checkboxes === n.checkboxes &&
    o.cell === n.cell &&
    o.valueTextAlign === n.valueTextAlign
);
