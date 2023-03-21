/* eslint-disable import/prefer-default-export */
import React, { useContext } from 'react';
import InstanceContext from '../../../contexts/InstanceContext';

export function ScreenReaderForSelections({ layout }) {
  const { translator } = useContext(InstanceContext);
  const { qStateCounts: s = {} } = layout?.qListObject?.qDimensionInfo || {};

  const count = s.qSelected + s.qSelectedExcluded + s.qLocked + s.qLockedExcluded;

  let t;
  switch (count) {
    case 0:
      t = 'ScreenReader.ZeroSelected';
      break;
    case 1:
      t = 'ScreenReader.OneSelected';
      break;
    default:
      t = 'ScreenReader.ManySelected';
      break;
  }

  const text = translator.get(t, count);

  return (
    <div className="screenReaderOnly" aria-live="assertive">
      {text}
    </div>
  );
}
