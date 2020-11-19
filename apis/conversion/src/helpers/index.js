import utils from '../utils';

/**
 * Restore properties that were temporarily changed during conversion.
 * @ignore
 * @param properties PropertyTree
 */
const restoreChangedProperties = (properties) => {
  Object.keys(properties.qLayoutExclude.changed).forEach((property) => {
    if (properties.qLayoutExclude.changed[property].to === utils.getValue(properties, property)) {
      // only revert back to old value if the current value is the same as it was changed to during conversion
      utils.setValue(properties, property, properties.qLayoutExclude.changed[property].from);
    }
  });
};

export default {
  restoreChangedProperties,
};
