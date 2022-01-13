const SELECTED_STATES = ['S', 'XS'];

const flattenArr = (arr) => arr.reduce((prev, cur) => prev.concat(cur));

function isStateSelected(qState) {
  return SELECTED_STATES.includes(qState);
}

export function getUniques(arr) {
  return Array.from(new Set(arr));
}

export function getSelectedValues(pages) {
  if (!pages) {
    return [];
  }
  const elementNbrs = pages.map((page) => {
    const elementNumbers = page.qMatrix.map((p) => {
      const [p0] = p;
      return isStateSelected(p0.qState) ? p0.qElemNumber : false;
    });
    return elementNumbers.filter((n) => n !== false);
  });
  return flattenArr(elementNbrs);
}

// export function getElementsFromPages(pages) {
//   const elements = pages.map((page) => page.qMatrix.map(([p0]) => p0));
//   return flattenArr(elements);
// }

export function fillRange(elementNbrs) {
  // TODO: Interpolate values.
  return elementNbrs;
}

export function applySelectionsOnPages(pages, elmNumbers, mouseDown, toggle = false) {
  const getNewSelectionState = (qState) =>
    !mouseDown && toggle && elmNumbers.length === 1 && isStateSelected(qState) ? 'A' : 'S';
  const matrices = pages.map((page) => {
    const qMatrix = page.qMatrix.map((p) => {
      const [p0] = p;
      const selectionMatchesElement = elmNumbers.includes(p0.qElemNumber);
      const qState = selectionMatchesElement ? getNewSelectionState(p0.qState) : p0.qState;
      return [{ ...p0, qState }, p.slice(1)];
    });
    return qMatrix;
  });
  const newPages = pages.map((page, i) => ({ ...page, qMatrix: matrices[i] }));
  return newPages;
}

export async function selectValues({ selections, elemNumbers, isSingleSelect = false }) {
  let resolved = Promise.resolve();
  const hasNanValues = elemNumbers.some((elemNumber) => Number.isNaN(elemNumber));
  if (!hasNanValues) {
    const elemNumbersToSelect = elemNumbers;
    resolved = selections.select({
      method: 'selectListObjectValues',
      params: ['/qListObjectDef', elemNumbersToSelect, !isSingleSelect],
    });
  }
  return resolved;
}
