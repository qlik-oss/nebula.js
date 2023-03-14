const SELECTED_STATES = ['S', 'XS'];

const flatten = (arr) => arr.reduce((prev, cur) => prev.concat(cur));

function isStateSelected(qState) {
  return SELECTED_STATES.includes(qState);
}

export function getUniques(arr) {
  return Array.isArray(arr) ? Array.from(new Set(arr)) : undefined;
}

export function getSelectedValues(pages) {
  if (!pages || !pages.length) {
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

export async function selectValues({ selections, elemNumbers, toggle, isSingleSelect }) {
  if (elemNumbers.length === 0) {
    return false;
  }
  const hasNanValues = elemNumbers.some((elemNumber) => Number.isNaN(elemNumber));
  let success = false;
  if (!hasNanValues) {
    const elemNumbersToSelect = elemNumbers;
    try {
      const response = await selections.select({
        method: 'selectListObjectValues',
        params: ['/qListObjectDef', elemNumbersToSelect, toggle],
      });
      success = response !== false;
    } catch {
      success = false;
    }
    if (!success) {
      if (isSingleSelect) {
        selections.cancel(); // revert selection
      } else {
        selections.clear();
      }
    }
  }
  return success;
}

export function getElemNumbersFromPages(pages) {
  if (!pages || !pages.length) {
    return [];
  }
  const elemNumbersArr = pages.map((page) => {
    const qElemNumbers = page.qMatrix.map((p) => {
      const [{ qElemNumber }] = p;
      return qElemNumber;
    });
    return qElemNumbers;
  });
  const elemNumbers = flatten(elemNumbersArr);
  return elemNumbers;
}

/**
 * @ignore
 * @interface MinMaxResult
 * @property {number} min
 * @property {number} max
 */

/**
 * Returns the min and max indices of elemNumbersOrdered which contains
 * all numbers in elementNbrs.
 *
 * @ignore
 * @param {number[]} elementNbrs
 * @param {number[]} elemNumbersOrdered
 * @returns {MinMaxResult}
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
