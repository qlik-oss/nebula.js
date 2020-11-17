/* eslint-disable no-param-reassign */
import utils from '../utils';

/**
 * Restore properties that were temporarily changed during conversion.
 * @ignore
 * @param tree PropertyTree
 */
const restoreChangedProperties = (tree) => {
  Object.keys(tree.qLayoutExclude.changed).forEach((property) => {
    if (tree.qLayoutExclude.changed[property].to === utils.getValue(tree, property)) {
      // only revert back to old value if the current value is the same as it was changed to during conversion
      utils.setValue(tree, property, tree.qLayoutExclude.changed[property].from);
    }
  });
};

export default {
  restoreChangedProperties,
};
