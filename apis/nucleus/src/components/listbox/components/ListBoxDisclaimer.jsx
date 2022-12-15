import React, { useContext } from 'react';
import InstanceContext from '../../../contexts/InstanceContext';

export default function ListBoxDisclaimer({ width }) {
  const { translator } = useContext(InstanceContext);
  const style = {
    fontSize: '16px',
    padding: '16px 0',
    textAlign: 'center',
    minWidth: width,
  };

  return <div style={style}>{translator.get('There are no matches for your search.')}</div>;
}
