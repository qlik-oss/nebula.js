/* eslint-disable no-param-reassign */
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

/**
 * Used for adding an index to an index array. An index array contains indices from 0-N in any order and
 * is used for keeping track of how items in another arrayed could be presented in a specific order.
 *
 * @ignore
 * @param array
 * @param index
 */
function indexAdded(array, index) {
  let i;
  for (i = 0; i < array.length; ++i) {
    if (array[i] >= 0 && array[i] >= index) {
      ++array[i];
    }
  }
  array.push(index);
}

/**
 * Used for removing an index from an index array. An index array contains indices from 0-N in any order and
 * is used for keeping track of how items in another arrayed could be presented in a specific order.
 *
 * @ignore
 * @param array
 * @param index
 */
function indexRemoved(array, index) {
  let removeIndex = 0;
  let i;
  for (i = 0; i < array.length; ++i) {
    if (array[i] > index) {
      --array[i];
    } else if (array[i] === index) {
      removeIndex = i;
    }
  }
  array.splice(removeIndex, 1);
  return removeIndex;
}

export default {
  isOrderedSubset,
  indexAdded,
  indexRemoved,
};
