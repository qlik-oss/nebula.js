/**
 * Returns true if the second array is a ordered subset of the first.
 *
 * @ignore
 * @param array1
 * @param array2
 * @returns {boolean}
 */
function isOrderedSubset(outer, subset) {
  if (!outer || !subset || !outer.length || !subset.length) {
    return false;
  }
  let start = outer.indexOf(subset[0]);

  if (start !== -1) {
    for (let i = 0; i < subset.length; i++) {
      const next = outer.indexOf(subset[i]);
      if (start > next) {
        return false;
      }
      start = next;
    }
    return true;
  }
  return false;
}

export default {
  isOrderedSubset,
};
