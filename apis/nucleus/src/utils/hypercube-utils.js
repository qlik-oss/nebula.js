// ------------ TODO: organize non exported functions in different files

import arrayUtil from '../../../conversion/src/array-util';

// TODO: move to constant values
const AUTOCALENDAR_NAME = '.autoCalendar';

const isDateField = (field) => {
  if (field.qDerivedFieldData) {
    return field.qTags.indexOf('$date') > -1 || field.qTags.indexOf('$timestamp') > -1;
  }
  return false;
};

const isGeoField = (field) => field.qTags.indexOf('$geoname') > -1;

const trimAutoCalendarName = (fieldName) => {
  const res = fieldName ? fieldName.split(AUTOCALENDAR_NAME).join('') : '';
  return res;
};

const expand = (list) => {
  const result = [];
  for (let i = 0; i < list.length; ++i) {
    const field = list[i];

    field.isDateField = isDateField(field);
    field.isGeoField = isGeoField(field);
    result.push(field);

    if (field.qDerivedFieldData) {
      for (let j = 0; j < field.qDerivedFieldData.qDerivedFieldLists.length; ++j) {
        const derived = field.qDerivedFieldData.qDerivedFieldLists[j];
        for (let k = 0; k < derived.qFieldDefs.length; ++k) {
          const derivedField = derived.qFieldDefs[k];

          result.push({
            qName: derivedField.qName,
            displayName: trimAutoCalendarName(derivedField.qName),
            qSrcTables: field.qSrcTables,
            qTags: derivedField.qTags,
            isDerived: true,
            isDerivedFromDate: field.isDateField,
            sourceField: field.qName,
            derivedDefinitionName: derived.qDerivedDefinitionName,
          });
        }
      }
    }
  }
  return result;
};

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
      dimension.qDef.qSortCriterias = [sortCriterias];
    } else {
      dimension.qDef.qSortCriterias[index] = sortCriterias;
    }
  });
};

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

export const findField = (name, fieldList) => {
  const expandedList = expand(arrayUtil.copy(fieldList));
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
