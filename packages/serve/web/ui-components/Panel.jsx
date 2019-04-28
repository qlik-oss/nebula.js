import React from 'react';

export default function Panel({
  children,
  style,
  variant = 'right',
}) {
  const inlineStyle = {
    backgroundColor: '#fff',
    flex: '0 0 300px',
    [variant === 'right' ? 'borderLeft' : 'borderRight']: '1px solid #ccc',
    ...style,
  };
  return (
    <div style={inlineStyle}>
      {children}
    </div>
  );
}
