import React from 'react';

function getFontSize(size) {
  if (size === 'large') {
    return '20px';
  }
  if (size === 'small') {
    return '12px';
  }
  return '16px';
}

export default function SvgIcon({ d, size, style = {}, viewBox = '0 0 16 16' }) {
  const s = {
    fontSize: getFontSize(size),
    display: 'inline-block',
    fontStyle: 'normal',
    lineHeight: '0',
    textAlign: 'center',
    textTransform: 'none',
    verticalAlign: '-.125em',
    textRendering: 'optimizeLegibility',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    ...style,
  };
  return (
    <i style={s}>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox={viewBox} fill="currentColor">
        <path d={d} />
      </svg>
    </i>
  );
}
