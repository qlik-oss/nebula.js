import { removeDimensionFromColumnOrder, removeDimensionFromColumnSortOrder } from './hypercube-utils';

async function removeMainDimension(self, index) {
  removeDimensionFromColumnSortOrder(self, index);
  await removeDimensionFromColumnOrder(self, index);
}

export default removeMainDimension;
