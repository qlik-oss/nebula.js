import { merge } from 'lodash';
import arrayUtil from '@nebula.js/conversion/src/array-util';

export const TOTAL_MAX = {
  DIMENSIONS: 1000, // Maximum number of active dimensions + disabled dimensions
  MEASURES: 1000, // Maximum number of active measures + disabled measures
};

export const notSupportedError = new Error('Not supported in this object, need to implement in subclass.');

/**
 * Get the field name from the expression.
 * @param {string} expression
 * @returns the field
 */
const getField = (expression) => {
  expression = expression.trim();
  if (expression.charAt(0) === '=') {
    expression = expression.substring(1);
    expression = expression.trim();
  }
  const lastIndex = expression.length - 1;
  if (expression.charAt(0) === '[' && expression.charAt(lastIndex) === ']') {
    expression = expression.substring(1, lastIndex);
    expression = expression.trim();
  }
  return expression;
};

/**
 * Find the field by its ID from the given fields array.
 * @param {Array} fields
 * @param {string} id
 * returns {Object|null} - The Dimension or Measure if found, otherwise null.
 */
export const findFieldById = (fields, id) => fields.find((field) => field.qDef?.cId === id) || null;

/**
 * Find a library item by its ID from the given master item list.
 * @param {string} id
 * @param {Array} masterItemList
 * @returns {Object|null} - The master item if found, otherwise null.
 */
export const findLibraryItem = (id, masterItemList) => {
  let i;
  let item;
  if (masterItemList) {
    for (i = 0; i < masterItemList.length; i++) {
      item = masterItemList[i];
      if (item.qInfo.qId === id) {
        return item;
      }
    }
  }
  return null;
};

/**
 * Find a field in the given master item list by its name.
 * @param {string} name - The name of the field to find.
 * @param {Array} fieldList - The list of fields to search in.
 * @returns {Object|null} - The field object, otherwise null.
 */
export const findField = (name, fieldList) => {
  const expandedList = merge(arrayUtil.copy(fieldList));
  let i;
  let item;
  name = getField(name);
  if (expandedList) {
    for (i = 0; i < expandedList.length; i++) {
      item = expandedList[i];
      if (item.qName === name) {
        return item;
      }
    }
  }
  return null;
};

/**
 * Set the auto sort criteria for the given fields and dimension.
 * @param {Array} fields
 * @param {Object} dimension
 * @param {Object} self
 */
export const setAutoSort = (fields, dimension, self) => {
  fields.forEach((field, index) => {
    const tags = field.qTags;
    const sortCriterias = {
      qSortByLoadOrder: 1,
    };

    if (typeof self.dimensionDefinition.autoSort === 'function') {
      self.dimensionDefinition.autoSort(dimension, self.properties, tags, sortCriterias, self);
    } else {
      // Default auto sorting
      sortCriterias.qSortByNumeric = 1;
      sortCriterias.qSortByAscii = 1;
    }

    if (!dimension.qDef.qSortCriterias) {
      const updatedDimension = { ...dimension };
      updatedDimension.qDef.qSortCriterias = [sortCriterias];
      Object.assign(dimension, updatedDimension);
    } else {
      dimension.qDef.qSortCriterias[index] = sortCriterias;
    }
  });
};

export const useMasterNumberFormat = (formatting) => {
  formatting.quarantine = {
    qNumFormat: formatting.qNumFormat || {},
    isCustomFormatted: formatting.isCustomFormatted || false,
  };
  formatting.qNumFormat = null;
  formatting.isCustomFormatted = undefined;
};
