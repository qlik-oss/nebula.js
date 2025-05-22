import { addMeasureToColumnSortOrder, moveMeasureColumnOrder } from './hypercube-utils';

function reinsertMainMeasure(self, measure, index) {
  const measures = self.getMeasures();
  const idx = index ?? measures.length;

  if (measures.length < self.maxMeasures()) {
    measures.splice(idx, 0, measure);

    addMeasureToColumnSortOrder(self, measures);
    return moveMeasureColumnOrder(self, measure);
  }

  return Promise.resolve(measure);
}

export default reinsertMainMeasure;
