import { addMeasureToColumnOrder, addMeasureToColumnSortOrder } from './hypercube-utils';

export default function addMeasureOrders(self, measure, measures, idx) {
  measures.splice(idx, 0, measure);

  return self.autoSortMeasure(measure).then(() => {
    addMeasureToColumnSortOrder(self, measure);
    addMeasureToColumnOrder(self, measure);

    return measure;
  });
}
