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

export default function filterpaneHandler({ /* dc, def, properties, */ children }) {
  const handler = {
    async addDimension(d) {
      const listboxProps = toListBox(d);
      const dimension = listboxProps.qListObjectDef;
      dimension.qDef.cId = dimension.qDef.cId || uid(); // maybe not needed

      if (!listboxProps.title) {
        // set title to undefined to make filterpane take title from library dimension or field name
        listboxProps.title = undefined;
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
