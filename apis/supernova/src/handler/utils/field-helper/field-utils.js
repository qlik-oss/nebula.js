import uid from '@nebula.js/nucleus/src/object/uid';
import { AUTOCALENDAR_NAME } from '../constants';

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

export const initializeId = (field) => ({
  ...field,
  qDef: {
    ...field.qDef,
    cId: field.qDef?.cId ?? uid(),
  },
});

export const initializeField = (field) => ({
  ...initializeId(field),
  qOtherTotalSpec: field.qOtherTotalSpec ?? {},
});

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
      dim.qDef.qSortCriterias = [sortCriterias];
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
