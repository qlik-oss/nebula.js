/* eslint-disable no-prototype-builtins */
/* eslint-disable no-param-reassign */
import extend from 'extend';
import utils from '../utils';

/**
 * Restore properties that were temporarily changed during conversion.
 *
 * @ignore
 * @param properties PropertyTree
 */
function restoreChangedProperties(properties) {
  Object.keys(properties.qLayoutExclude.changed).forEach((property) => {
    if (properties.qLayoutExclude.changed[property].to === utils.getValue(properties, property)) {
      // only revert back to old value if the current value is the same as it was changed to during conversion
      utils.setValue(properties, property, properties.qLayoutExclude.changed[property].from);
    }
  });
}

/**
 * Used to check if a property key is part of the master item information
 *
 * @ignore
 * @param propertyName Name of the key in the properties object
 * @returns {boolean}
 */
function isMasterItemPropperty(propertyName) {
  return ['qMetaDef', 'descriptionExpression', 'labelExpression'].indexOf(propertyName) !== -1;
}

function importCommonProperties(newProperties, exportFormat, initialProperties) {
  // always copy type and visualization
  if (exportFormat.properties.qInfo.qType === 'masterobject') {
    newProperties.qInfo.qType = 'masterobject';
  } else {
    newProperties.qInfo.qType = initialProperties.qInfo.qType;
  }
  newProperties.visualization = initialProperties.visualization;
}

function copyPropertyIfExist(propertyName, source, target) {
  if (source.hasOwnProperty(propertyName)) {
    target[propertyName] = source[propertyName];
  }
}

function copyPropertyOrSetDefault(propertyName, source, target, defaultValue) {
  if (source.hasOwnProperty(propertyName)) {
    target[propertyName] = source[propertyName];
  } else {
    target[propertyName] = defaultValue;
  }
}

function createDefaultDimension(dimensionDef, dimensionProperties) {
  const def = extend(true, {}, dimensionProperties, dimensionDef);
  if (!utils.getValue(def, 'qOtherTotalSpec.qOtherCounted')) {
    utils.setValue(def, 'qOtherTotalSpec.qOtherCounted', { qv: '10' });
  }
  if (!utils.getValue(def, 'qOtherTotalSpec.qOtherLimit')) {
    utils.setValue(def, 'qOtherTotalSpec.qOtherLimit', { qv: '0' });
  }
  if (!def.hasOwnProperty('othersLabel')) {
    def.othersLabel = 'Others'; // TODO: translator.get('properties.dimensionLimits.others')
  }
  return def;
}

function createDefaultMeasure(measureDef, measureProperties) {
  return extend(true, {}, measureProperties, measureDef);
}

function resolveValue(data, input, defaultValue) {
  if (typeof data === 'function') {
    return data(input);
  }
  return !Number.isNaN(+data) ? data : defaultValue;
}

function getHypercubePath(qae) {
  const path = utils.getValue(qae, 'data.targets.0.propertyPath', '');
  const steps = path.split('/');
  if (steps.length && steps[steps.length - 1] === 'qHyperCubeDef') {
    steps.length -= 1;
  }
  return steps.join('.');
}

function getDefaultDimension() {
  return {
    qDef: {
      autoSort: true,
      cId: '',
      othersLabel: 'Others', // TODO: translator.get('properties.dimensionLimits.others')
    },
    qLibraryId: '',
    qNullSuppression: false,
    qOtherLabel: 'Others',
    qOtherTotalSpec: {
      qOtherLimitMode: 'OTHER_GE_LIMIT',
      qOtherMode: 'OTHER_OFF',
      qOtherSortMode: 'OTHER_SORT_DESCENDING',
      qSuppressOther: false,
    },
  };
}

function getDefaultMeasure() {
  return {
    qDef: {
      autoSort: true,
      cId: '',
      numFormatFromTemplate: true,
    },
    qLibraryId: '',
    qTrendLines: [],
  };
}

export default {
  restoreChangedProperties,
  isMasterItemPropperty,
  importCommonProperties,
  copyPropertyIfExist,
  copyPropertyOrSetDefault,
  createDefaultDimension,
  createDefaultMeasure,
  resolveValue,
  getHypercubePath,
  getDefaultDimension,
  getDefaultMeasure,
};
