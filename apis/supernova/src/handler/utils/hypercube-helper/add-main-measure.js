import { addMeasureToColumnOrder, addMeasureToColumnSortOrder } from './hypercube-utils';

function addMainMeasure(self, measure, index) {
  const measures = self.getMeasures();
  const idx = index ?? measures.length;

  if (measures.length < self.maxMeasures()) {
    measures.splice(idx, 0, measure);

    return self.autoSortMeasure(measure).then(() => {
      addMeasureToColumnSortOrder(self, measures);
      addMeasureToColumnOrder(self, measure).then(() => measure);
      return measure;
    });
  }

  return Promise.resolve();
}

export default addMainMeasure;
