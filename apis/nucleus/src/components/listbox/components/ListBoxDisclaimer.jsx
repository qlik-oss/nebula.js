import React from 'react';

export default function ListBoxDisclaimer({ width }) {
  const style = {
    fontSize: '16px',
    padding: '16px 0',
    textAlign: 'center',
    minWidth: width,
  };

  return <div style={style}>There are no matches for your search.</div>;
}
