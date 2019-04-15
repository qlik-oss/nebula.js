import React from 'react';

export default function Toolbar({ children, style }) {
  const inlineStyle = {
    background: '#fafafa',
    flex: '0 0 24px',
    padding: '8px',
    borderBottom: '1px solid #ccc',
    ...style,
  };

  return (
    <div style={inlineStyle}>
      {children}
    </div>
  );
}
