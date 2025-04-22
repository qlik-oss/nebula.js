import { trimAutoCalendarName } from '../utils';

const getDerivedFields = (field) => {
  const derivedFields = [];

  if (!field.qDerivedFieldData) {
    return derivedFields;
  }

  field.qDerivedFieldData.qDerivedFieldLists.forEach((derived) => {
    derived.qFieldDefs.forEach((derivedField) => {
      derivedFields.push({
        qName: derivedField.qName,
        displayName: trimAutoCalendarName(derivedField.qName),
        qSrcTables: field.qSrcTables,
        qTags: derivedField.qTags,
        isDerived: true,
        isDerivedFromDate: field.isDateField,
        sourceField: field.qName,
        derivedDefinitionName: derived.qDerivedDefinitionName,
      });
    });
  });

  return derivedFields;
};

export default getDerivedFields;
