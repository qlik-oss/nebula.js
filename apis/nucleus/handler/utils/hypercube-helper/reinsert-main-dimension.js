import { addDimensionToColumnSortOrder, moveDimensionToColumnOrder } from './hypercube-utils';

function reinsertMainDimension(self, dimension, index) {
  const dimensions = self.getDimensions();
  const idx = index ?? dimensions.length;

  if (dimensions.length < self.maxDimensions()) {
    dimensions.splice(idx, 0, dimension);

    addDimensionToColumnSortOrder(self, dimensions);
    return moveDimensionToColumnOrder(self, dimension);
  }

  return Promise.resolve(dimension);
}

export default reinsertMainDimension;
