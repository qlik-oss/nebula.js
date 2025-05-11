import { removeDimensionFromColumnOrder, removeMeasureFromColumnSortOrder } from './hypercube-utils';

export default async function removeMainMeasure(self, index) {
  removeMeasureFromColumnSortOrder(self, index);
  await removeDimensionFromColumnOrder(self, index);
}
