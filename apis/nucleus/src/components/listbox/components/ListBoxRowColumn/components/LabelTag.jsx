import React from 'react';
import ValueField from './ValueField';

export default function LabelTag({ label, color, highlighted, dense, showGray, checkboxes, cell, valueTextAlign }) {
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
