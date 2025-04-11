import { merge } from 'lodash';
import arrayUtil from '@nebula.js/conversion/src/array-util';

export const TOTAL_MAX = {
  DIMENSIONS: 1000, // Maximum number of active dimensions + disabled dimensions
  MEASURES: 1000, // Maximum number of active measures + disabled measures
};

const AUTOCALENDAR_NAME = '.autoCalendar';

export const notSupportedError = new Error('Not supported in this object, need to implement in subclass.');

/**
 * Get the field name from the expression.
 * @param {string} expression
 * @returns the field
 */
const getField = (expression) => {
  let exp = expression;
  exp = exp.trim();
  if (exp.charAt(0) === '=') {
    exp = exp.substring(1);
    exp = exp.trim();
  }
  const lastIndex = exp.length - 1;
  if (exp.charAt(0) === '[' && exp.charAt(lastIndex) === ']') {
    exp = exp.substring(1, lastIndex);
    exp = exp.trim();
  }
  return exp;
};

export const findFieldById = (fields, id) => (fields && fields.find((field) => field.qDef?.cId === id)) || null;

export const findLibraryItem = (id, masterItemList) =>
  (masterItemList && masterItemList.find((item) => item.qInfo.qId === id)) || null;

const findFieldByName = (name, fieldList) => (fieldList && fieldList.find((field) => field.qName === name)) || null;

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
  const format = formatting;
  format.quarantine = {
    qNumFormat: format.qNumFormat || {},
    isCustomFormatted: format.isCustomFormatted || false,
  };
  format.qNumFormat = null;
  format.isCustomFormatted = undefined;
};

const isDateField = (field) =>
  field.qDerivedFieldData && (field.qTags.indexOf('$date') > -1 || field.qTags.indexOf('$timestamp') > -1);

const isGeoField = (field) => field.qTags.indexOf('$geoname') > -1;

const trimAutoCalendarName = (fieldName) => (fieldName ? fieldName.split(AUTOCALENDAR_NAME).join('') : '');

const getDerivedFieldInfo = (derivedField, field, derived) => ({
  qName: derivedField.qName,
  displayName: trimAutoCalendarName(derivedField.qName),
  qSrcTables: field.qSrcTables,
  qTags: derivedField.qTags,
  isDerived: true,
  isDerivedFromDate: field.isDateField,
  sourceField: field.qName,
  derivedDefinitionName: derived.qDerivedDefinitionName,
});

const processField = (field) => {
  const item = field;
  item.isDateField = isDateField(item);
  item.isGeoField = isGeoField(item);
  return item;
};

const processDerivedFields = (field) => {
  const derivedFields = [];

  if (field.qDerivedFieldData) {
    field.qDerivedFieldData.qDerivedFieldLists.forEach((derived) => {
      derived.qFieldDefs.forEach((derivedField) => {
        derivedFields.push(getDerivedFieldInfo(derivedField, field, derived));
      });
    });
  }

  return derivedFields;
};

export const expandFieldsWithDerivedData = (list) => {
  const result = [];
  list.forEach((field) => {
    result.push(processField(field));

    const derivedFields = processDerivedFields(field);
    result.push(...derivedFields);
  });

  return result;
};

/**
 * Find a field in the given master item list by its name.
 * @param {string} name - The name of the field to find.
 * @param {Array} fieldList - The list of fields to search in.
 * @returns {Object|null} - The field object, otherwise null.
 */
export const findField = (name, fieldList) => {
  const expandedList = expandFieldsWithDerivedData(fieldList.slice(0));
  const fieldName = getField(name);
  return (expandedList && findFieldByName(fieldName, expandedList)) || null;
};
