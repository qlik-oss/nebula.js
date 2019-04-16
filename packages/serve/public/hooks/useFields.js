import { useModel, useLayout } from 'hamus.js';

export default function useFields(app) {
  const [model] = useModel(app, {
    qInfo: {
      qType: 'FieldList',
      qId: 'FieldList',
    },
    qFieldListDef: {
      qShowDerivedFelds: false,
      qShowHidden: false,
      qShowSemantic: true,
      qShowSrcTables: true,
      qShowSystem: false,
    },
  });

  return useLayout(model);
}
