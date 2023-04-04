export const focusSearch = (container) => {
  const searchField = container?.querySelector('.search input');
  searchField?.focus();
  return searchField;
};

export function removeInnnerTabStops(container) {
  container?.querySelectorAll('[tabIndex="0"]').forEach((elm) => {
    elm.setAttribute('tabIndex', -1);
  });
}

export function getVizCell(container) {
  return container?.closest('.njs-cell') || container?.closest('.qv-gridcell');
}

export const focusRow = (container) => {
  const row = container?.querySelector('.value[tabIndex="0"]');
  row?.focus();
  return row;
};
