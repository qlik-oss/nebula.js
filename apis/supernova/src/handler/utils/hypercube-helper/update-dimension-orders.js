import { addDimensionToColumnOrder, addDimensionToColumnSortOrder } from './hypercube-utils';

function updateDimensionOrders(self, dimension, index) {
  const dimensions = self.getDimensions();
  dimensions.splice(index, 0, dimension);

  return self.autoSortDimension(dimension).then(async () => {
    addDimensionToColumnSortOrder(self, dimensions, index);
    await addDimensionToColumnOrder(self, dimension);

    return dimension;
  });
}
export default updateDimensionOrders;
