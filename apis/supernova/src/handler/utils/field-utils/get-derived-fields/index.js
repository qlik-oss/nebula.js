import { getDerivedFieldInfo } from '../utils';

const getDerivedFields = (field) => {
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

export default getDerivedFields;
