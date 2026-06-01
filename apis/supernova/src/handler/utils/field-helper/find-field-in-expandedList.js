import expandFieldsWithDerivedData from './expand-field-derived-data';
import { findFieldByName, getField } from './field-utils';

const findFieldInExpandedList = (name, fieldList) => {
  const expandedList = expandFieldsWithDerivedData(fieldList.slice(0));
  const fieldName = getField(name);
  return (expandedList && findFieldByName(fieldName, expandedList)) || null;
};

export default findFieldInExpandedList;
