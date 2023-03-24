import React from 'react';
import ValueField from './ValueField';

function LabelTag({ label, color, dense, showGray, checkboxes, cell, valueTextAlign }) {
  if (typeof label === 'string') {
    return (
      <ValueField
        label={label}
        color={color}
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

export default LabelTag;
