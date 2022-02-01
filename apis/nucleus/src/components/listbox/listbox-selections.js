const SELECTED_STATES = ['S', 'XS'];

const flattenArr = (arr) => arr.reduce((prev, cur) => prev.concat(cur));

function isStateSelected(qState) {
  return SELECTED_STATES.includes(qState);
}

export function getUniques(arr) {
  return Array.isArray(arr) ? Array.from(new Set(arr)) : undefined;
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

export function applySelectionsOnPages(pages, elmNumbers, toggle = false) {
  const getNewSelectionState = (qState) => (toggle && elmNumbers.length === 1 && isStateSelected(qState) ? 'A' : 'S');
  const matrices = pages.map((page) => {
    const qMatrix = page.qMatrix.map((p) => {
      const [p0] = p;
      const selectionMatchesElement = elmNumbers.includes(p0.qElemNumber);
      const qState = selectionMatchesElement ? getNewSelectionState(p0.qState) : p0.qState;
      return [{ ...p0, qState }, p.slice(1)];
    });
    return { ...page, qMatrix };
  });
  return matrices;
}

export async function selectValues({ selections, elemNumbers, isSingleSelect = false }) {
  let resolved = Promise.resolve(false);
  const hasNanValues = elemNumbers.some((elemNumber) => Number.isNaN(elemNumber));
  if (!hasNanValues) {
    const elemNumbersToSelect = elemNumbers;
    resolved = selections
      .select({
        method: 'selectListObjectValues',
        params: ['/qListObjectDef', elemNumbersToSelect, !isSingleSelect],
      })
      .then((success) => success !== false)
      .catch(() => false);
  }
  return resolved;
}
