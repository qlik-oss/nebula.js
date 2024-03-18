const LOC_STATES = {
  S: 'Object.Listbox.Selected',
  A: 'Object.Listbox.Alternative',
  O: 'Object.Listbox.Optional',
  XS: 'Object.Listbox.SelectedExcluded',
  L: 'Object.Listbox.Locked',
  X: 'Object.Listbox.Excluded',
  XL: 'Object.Listbox.ExcludedLock',
};

export default function getValueLabel({
  translator: translatorDynamic,
  label,
  qState,
  isSelected,
  currentIndex,
  maxIndex,
  showSearch,
}) {
  const stateTranslation = LOC_STATES[qState];
  const state = translatorDynamic.get(stateTranslation);
  const srStringArr = [];

  if (isSelected) {
    const navTranslation = showSearch
      ? 'Listbox.ScreenReader.SearchThenSelectionsMenu.WithAccSelMenu'
      : 'Listbox.ScreenReader.SelectionMenu.WithAccSelMenu';
    const nav = translatorDynamic.get(navTranslation);
    srStringArr.push(nav);
  }

  const valueString = `${label} ${state}`;
  const indexString = translatorDynamic.get('CurrentSelections.Of', [currentIndex + 1, maxIndex + 1]); // E.g. 3 of 20
  srStringArr.unshift(valueString, indexString);
  const srString = srStringArr.join('. ').trim();
  return srString;
}
