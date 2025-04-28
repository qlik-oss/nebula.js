import { removeDimensionFromColumnOrder, removeDimensionFromColumnSortOrder } from './hypercube-utils';

export default async function removeMainDimension(self, index) {
  removeDimensionFromColumnSortOrder(self, index);
  await removeDimensionFromColumnOrder(self, index);
}
