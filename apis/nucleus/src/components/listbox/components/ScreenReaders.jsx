/* eslint-disable import/prefer-default-export */
import React, { useContext } from 'react';
import InstanceContext from '../../../contexts/InstanceContext';

const LOC_STATES = {
  S: 'Object.Listbox.Selected',
  A: 'Object.Listbox.Alternative',
  O: 'Object.Listbox.Optional',
  XS: 'Object.Listbox.SelectedExcluded',
  L: 'Object.Listbox.Locked',
  X: 'Object.Listbox.Excluded',
  XL: 'Object.Listbox.ExcludedLock',
};

export function getValueLabel({ translator, label, qState, isSelected, currentIndex, maxIndex, showSearch }) {
  const stateTranslation = LOC_STATES[qState];
  const state = translator.get(stateTranslation);
  const srStringArr = [];

  if (isSelected) {
    const navTranslation = showSearch
      ? 'Listbox.ScreenReader.SearchThenSelectionsMenu.WithAccSelMenu'
      : 'Listbox.ScreenReader.SelectionMenu.WithAccSelMenu';
    const nav = translator.get(navTranslation);
    srStringArr.push(nav);
  }

  const valueString = `${label} ${state}`;
  const indexString = translator.get('CurrentSelections.Of', [currentIndex + 1, maxIndex + 1]); // E.g. 3 of 20
  srStringArr.unshift(valueString, indexString);
  const srString = srStringArr.join('. ').trim();
  return srString;
}

/**
 * Announces the selection state.
 *
 * @ignore
 * @param {Layout} object
 * @returns {Element} An (invisible) component.
 */
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

  const text = translator.get(t, [count]);

  return (
    <div className="screenReaderOnly" aria-live="assertive">
      {text}
    </div>
  );
}
