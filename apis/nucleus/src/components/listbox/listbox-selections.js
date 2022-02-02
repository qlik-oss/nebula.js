const SELECTED_STATES = ['S', 'XS'];

const flatten = (arr) => arr.reduce((prev, cur) => prev.concat(cur));

function isStateSelected(qState) {
  return SELECTED_STATES.includes(qState);
}

export function getUniques(arr) {
  return Array.isArray(arr) ? Array.from(new Set(arr)) : undefined;
}

export function containEquals(arr1, arr2) {
  return Array.from(new Set(arr1.sort())).join(',') === Array.from(new Set(arr2.sort())).join(',');
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
  return flatten(elementNbrs);
}

export function applySelectionsOnPages(pages, elmNumbers) {
  const getNewSelectionState = (qState) => (elmNumbers.length <= 1 && isStateSelected(qState) ? 'A' : 'S');
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

export async function selectValues({ selections, elemNumbers, toggle = false }) {
  let resolved = Promise.resolve(false);
  const hasNanValues = elemNumbers.some((elemNumber) => Number.isNaN(elemNumber));
  if (!hasNanValues) {
    const elemNumbersToSelect = elemNumbers;
    resolved = selections
      .select({
        method: 'selectListObjectValues',
        params: ['/qListObjectDef', elemNumbersToSelect, toggle],
      })
      .then((success) => success !== false)
      .catch(() => false);
  }
  return resolved;
}

export function getElemNumbersFromPages(pages) {
  if (!pages) {
    return [];
  }
  const elemNumbersArr = pages.map((page) => {
    const qElemNumbers = page.qMatrix.map((p) => {
      const [{ qElemNumber }] = p;
      return qElemNumber;
    });
    return [...qElemNumbers];
  });
  const elemNumbers = flatten(elemNumbersArr);
  return elemNumbers;
}

/**
 * Returns the min and max indices of elemNumbersOrdered which contains
 * all numbers in elementNbrs.
 *
 * @param {array(number)} elementNbrs
 * @param {array(number)} elemNumbersOrdered
 * @returns { min: {number}, max: {number} }
 */
function getMinMax(elementNbrs, elemNumbersOrdered) {
  let min = Infinity;
  let max = -Infinity;
  elementNbrs.forEach((nbr) => {
    const index = elemNumbersOrdered.indexOf(nbr);
    min = index < min ? index : min;
    max = index > max ? index : max;
  });
  return { min, max };
}

export function fillRange(elementNbrs, elemNumbersOrdered) {
  if (!elementNbrs) {
    return [];
  }
  if (elementNbrs.length <= 1) {
    return elementNbrs;
  }
  // Interpolate values algorithm
  const { min, max } = getMinMax(elementNbrs, elemNumbersOrdered);
  return elemNumbersOrdered.slice(min, max + 1);
}
