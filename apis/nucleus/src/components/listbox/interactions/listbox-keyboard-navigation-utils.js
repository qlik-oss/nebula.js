export function removeInnnerTabStops(container) {
  container?.querySelectorAll('[tabIndex="0"]').forEach((elm) => {
    elm.setAttribute('tabIndex', -1);
  });
}

export function getVizCell(container) {
  return container?.closest('.njs-cell') || container?.closest('.qv-gridcell');
}
