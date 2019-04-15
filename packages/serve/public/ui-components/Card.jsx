import React from 'react';

export default function Card({
  children,
  style,
}) {
  const inlineStyle = {
    backgroundColor: '#fff',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxShadow: '0px 16px 8px -8px rgba(100, 100, 100, 0.2)',
    margin: '8px',
    ...style,
  };
  return (
    <div style={inlineStyle}>
      {children}
    </div>
  );
}
