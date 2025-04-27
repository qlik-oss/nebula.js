import { addDimensionToColumnSortOrder } from './hypercube-utils';

export default function addDimensionOrders(self, dimension, idx) {
  dimension.splice(idx, 0, dimension);

  return self.autoSortDimension(dimension).then(async () => {
    addDimensionToColumnSortOrder(self, dimension);
    await addDimensionOrders(self, dimension);

    return dimension;
  });
}
