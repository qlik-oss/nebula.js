import extend from 'extend';
import uid from './uid';
import defaultListboxProperties from '../components/listbox/default-properties';

const nxDimension = (f) => ({
  qDef: {
    qFieldDefs: [f],
  },
});
export const toListBox = (d) => {
  let listboxProps;
  if (typeof d === 'string') {
    listboxProps = extend(true, {}, defaultListboxProperties, { qListObjectDef: nxDimension(d) });
  } else if (d.qListObjectDef) {
    listboxProps = extend(true, {}, defaultListboxProperties, d);
  } else {
    listboxProps = extend(true, {}, defaultListboxProperties, { qListObjectDef: d });
  }
  return listboxProps;
};

export default function filterpaneHandler({ /* dc, def, properties, */ children, halo }) {
  const handler = {
    async addDimension(d) {
      const listboxProps = toListBox(d);
      const dimension = listboxProps.qListObjectDef;
      dimension.qDef.cId = dimension.qDef.cId || uid(); // maybe not needed

      if (!listboxProps.title) {
        if (dimension.qLibraryId) {
          const dimModel = await halo.app.getDimension(dimension.qLibraryId);
          const dimProps = await dimModel.getProperties();
          if (dimProps.qDim.qLabelExpression) {
            listboxProps.title = {
              qStringExpression: {
                qExpr: dimProps.qDim.qLabelExpression,
              },
            };
          } else if (dimProps.qDim.qGrouping === 'C') {
            listboxProps.title = {
              qStringExpression: {
                qExpr: `GroupDimensionLabel('${dimProps.qDim.title}')`,
              },
            };
          }
          // For regular (non-cyclic) master dimensions without a label expression,
          // leave title empty so qFallbackTitle is used instead. This ensures the
          // filterpane title always reflects the current master dimension name.
        } else {
          listboxProps.title =
            dimension.qDef.title || dimension.qDef.qFieldLabels?.[0] || dimension.qDef.qFieldDefs?.[0];
        }
      }
      // def.dimensions.added(dimension, properties, listboxProps);
      children.push({
        qProperty: listboxProps,
        qChildren: [],
      });
    },
    addMeasure() {},
  };

  return handler;
}
