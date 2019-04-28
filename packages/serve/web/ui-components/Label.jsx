import React from 'react';

export default function Label({
  children,
  style,
  size = 'medium',
  weight = 'regular',
}) {
  const sizes = {
    small: '12px',
    medium: '14px',
    large: '16px',
    xlarge: '24px',
  };
  const weights = {
    light: 300,
    regular: 400,
    semibold: 600,
    bold: 800,
  };

  const fontSize = sizes[size];
  const fontWeight = weights[weight];
  const lineHeight = parseInt(fontSize, 10) < 16 ? 16 : 24;

  const inlineStyle = {
    margin: '8px',
    fontSize,
    fontWeight,
    lineHeight: `${lineHeight}px`,
    display: 'inline-block',
    ...style,
  };
  return (
    <span style={inlineStyle}>
      {children}
    </span>
  );
}
