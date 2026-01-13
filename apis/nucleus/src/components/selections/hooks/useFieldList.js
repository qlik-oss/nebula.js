import useOnChange from '../../../hooks/useOnChange';

const expand = (m) =>
  m.getLayout().then((list) => {
    const result = [];
    const items = list.qFieldList.qItems;
    for (let i = 0; i < items.length; ++i) {
      const field = items[i];
      result.push(field);

      if (field.qDerivedFieldData) {
        for (let j = 0; j < field.qDerivedFieldData.qDerivedFieldLists.length; ++j) {
          const derived = field.qDerivedFieldData.qDerivedFieldLists[j];
          for (let k = 0; k < derived.qFieldDefs.length; ++k) {
            const derivedField = derived.qFieldDefs[k];

            result.push({
              qName: derivedField.qName,
              qSrcTables: field.qSrcTables,
              qTags: derivedField.qTags,
              isDerived: true,
              sourceField: field.qName,
              derivedDefinitionName: derived.qDerivedDefinitionName,
            });
          }
        }
      }
    }
    return result;
  });

const useFieldList = (model) => useOnChange(model, (m) => expand(m));
export default useFieldList;
