export default function getTabIndex({ index, lastFocusedRow, cell }) {
  let tabIndex = -1;
  if (typeof lastFocusedRow === 'number') {
    tabIndex = lastFocusedRow === cell?.qElemNumber ? 0 : -1;
  } else {
    tabIndex = index === 0 ? 0 : -1;
  }
  return tabIndex;
}
