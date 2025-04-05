import { findLibraryItem, setAutoSort } from '../utils';

function getAutoSortLibraryDimension(self, dimension) {
  return self.app.getDimensionList().then((dimensionList) => {
    const libDim = findLibraryItem(dimension.qLibraryId, dimensionList);
    if (libDim) {
      setAutoSort(libDim.qData.info, dimension, self);
    }
    return dimension;
  });
}

export default getAutoSortLibraryDimension;
