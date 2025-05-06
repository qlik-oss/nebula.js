import findFieldInExpandedList from './find-field-in-expandedList';
import { setAutoSort } from './field-utils';

function getAutoSortFieldDimension(self, dimension) {
  return self.app.getFieldList().then((fieldList) => {
    const field = dimension?.qDef?.qFieldDefs && findFieldInExpandedList(dimension.qDef.qFieldDefs[0], fieldList);
    if (field) {
      setAutoSort([field], dimension, self);
    }
    return dimension;
  });
}

export default getAutoSortFieldDimension;
