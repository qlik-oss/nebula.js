/* eslint-disable no-prototype-builtins */
/* eslint-disable no-param-reassign */
import extend from 'extend';
import utils from '../utils';
import arrayUtils from '../array-util';

const MAX_SAFE_INTEGER = 2 ** 53 - 1;

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
  const qType =
    utils.getValue(exportFormat, 'properties.qInfo.qType') === 'masterobject'
      ? 'masterobject'
      : utils.getValue(initialProperties, 'qInfo.qType');
  utils.setValue(newProperties, 'qInfo.qType', qType);
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

function getOthersLabel() {
  return 'Others'; // TODO: translator.get('properties.dimensionLimits.others')
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
    def.othersLabel = getOthersLabel();
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
      othersLabel: getOthersLabel(),
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

function setInterColumnSortOrder({ exportFormat, newHyperCubeDef }) {
  const dataGroup = exportFormat.data[0];
  const nCols = newHyperCubeDef.qDimensions.length + newHyperCubeDef.qMeasures.length;
  newHyperCubeDef.qInterColumnSortOrder = dataGroup.interColumnSortOrder.concat();

  let i = newHyperCubeDef.qInterColumnSortOrder.length;
  if (i !== nCols) {
    if (newHyperCubeDef.qLayoutExclude) {
      // Store them if needed
      newHyperCubeDef.qLayoutExclude.qHyperCubeDef.qInterColumnSortOrder = dataGroup.interColumnSortOrder.concat();
    }
    while (i !== nCols) {
      if (i < nCols) {
        arrayUtils.indexAdded(newHyperCubeDef.qInterColumnSortOrder, i);
        ++i;
      } else {
        --i;
        arrayUtils.indexRemoved(newHyperCubeDef.qInterColumnSortOrder, i);
      }
    }
  }
}

function createNewProperties({ exportFormat, initialProperties, hypercubePath }) {
  let newProperties = { qLayoutExclude: { disabled: {}, quarantine: {} } };

  Object.keys(exportFormat.properties).forEach((key) => {
    if (key === 'qLayoutExclude') {
      if (exportFormat.properties[key].quarantine) {
        newProperties.qLayoutExclude.quarantine = extend(true, {}, exportFormat.properties[key].quarantine);
      }
    } else if (key === 'qHyperCubeDef' && hypercubePath) {
      utils.setValue(newProperties, `${hypercubePath}.qHyperCubeDef`, exportFormat.properties.qHyperCubeDef);
    } else if (initialProperties.hasOwnProperty(key) || isMasterItemPropperty(key)) {
      // TODO: qExtendsId ??
      newProperties[key] = exportFormat.properties[key];
    } else {
      newProperties.qLayoutExclude.disabled[key] = exportFormat.properties[key];
    }
  });

  newProperties = extend(true, {}, initialProperties, newProperties);
  if (newProperties.components === null) {
    newProperties.components = [];
  }
  return newProperties;
}

function getMaxMinDimensionMeasure({ exportFormat, dataDefinition = {} }) {
  const dataGroup = exportFormat.data[0];
  const dimensionDef = dataDefinition.dimensions || { max: 0 };
  const measureDef = dataDefinition.measures || { max: 0 };
  const maxMeasures = resolveValue(measureDef.max, dataGroup.dimensions.length, MAX_SAFE_INTEGER);
  const minMeasures = resolveValue(measureDef.min, dataGroup.dimensions.length, 0);
  const maxDimensions = resolveValue(dimensionDef.max, maxMeasures, MAX_SAFE_INTEGER);
  const minDimensions = resolveValue(dimensionDef.min, minMeasures, 0);
  return { maxDimensions, minDimensions, maxMeasures, minMeasures };
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
  setInterColumnSortOrder,
  createNewProperties,
  getMaxMinDimensionMeasure,
};
