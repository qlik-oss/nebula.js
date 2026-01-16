import useModel from '../../../hooks/useModel';
import useRpc from '../../../hooks/useRpc';

const fieldListProps = {
  qInfo: {
    qId: 'FieldList',
    qType: 'FieldList',
  },
  qFieldListDef: {
    qShowSystem: false,
    qShowHidden: false,
    qShowSrcTables: true,
    qShowSemantic: true,
    qShowDerivedFields: true,
  },
};

const expand = (items) => {
  if (!items) {
    return undefined;
  }
  const result = [];
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
};

const useFieldList = (app) => {
  const [model] = useModel(app, 'FieldList', fieldListProps);
  const [layout] = useRpc(model, 'getLayout');
  const items = expand(layout?.qFieldList?.qItems);
  return [items];
};
export default useFieldList;
