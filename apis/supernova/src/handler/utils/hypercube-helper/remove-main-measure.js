import { removeMeasureFromColumnOrder, removeMeasureFromColumnSortOrder } from './hypercube-utils';

async function removeMainMeasure(self, index) {
  removeMeasureFromColumnSortOrder(self, index);
  await removeMeasureFromColumnOrder(self, index);
}

export default removeMainMeasure;
