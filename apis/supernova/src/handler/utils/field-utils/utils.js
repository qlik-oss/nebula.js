import { AUTOCALENDAR_NAME } from '../constants';

/**
 * Get the field name from the expression.
 * @param {string} expression
 * @returns the field
 */
export const getField = (expression) => {
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

export const findFieldByName = (name, fieldList) =>
  (fieldList && fieldList.find((field) => field.qName === name)) || null;

/**
 * Set the auto sort criteria for the given fields and dimension.
 * @param {Array} fields
 * @param {Object} dimension
 * @param {Object} self
 */
export const setAutoSort = (fields, dimension, self) => {
  const dim = dimension;
  fields.forEach((field, index) => {
    const tags = field.qTags;
    const sortCriterias = {
      qSortByLoadOrder: 1,
    };

    if (typeof self.dimensionDefinition.autoSort === 'function') {
      self.dimensionDefinition.autoSort(dim, self.properties, tags, sortCriterias, self);
    } else {
      // Default auto sorting
      sortCriterias.qSortByNumeric = 1;
      sortCriterias.qSortByAscii = 1;
    }

    if (!dim.qDef.qSortCriterias) {
      const updatedDimension = { ...dim };
      updatedDimension.qDef.qSortCriterias = [sortCriterias];
      Object.assign(dim, updatedDimension);
    } else {
      dim.qDef.qSortCriterias[index] = sortCriterias;
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

export const isDateField = (field) =>
  field?.qDerivedFieldData && (field?.qTags?.indexOf('$date') > -1 || field?.qTags?.indexOf('$timestamp') > -1);

export const isGeoField = (field) => field.qTags.indexOf('$geoname') > -1;

export const trimAutoCalendarName = (fieldName) => (fieldName ? fieldName.split(AUTOCALENDAR_NAME).join('') : '');

export const getDerivedFieldInfo = (derivedField, field, derived) => ({
  qName: derivedField.qName,
  displayName: trimAutoCalendarName(derivedField.qName),
  qSrcTables: field.qSrcTables,
  qTags: derivedField.qTags,
  isDerived: true,
  isDerivedFromDate: field.isDateField,
  sourceField: field.qName,
  derivedDefinitionName: derived.qDerivedDefinitionName,
});
