import { addMeasureToColumnOrder, addMeasureToColumnSortOrder } from './hypercube-utils';

export default function addMainMeasure(self, measure, index) {
  const measures = self.getMeasures();
  const idx = index ?? measures.length;

  if (idx && measures.length < self.maxMeasures()) {
    measures.splice(idx, 0, measure);

    return self.autoSortMeasure(measure).then(() => {
      addMeasureToColumnSortOrder(self, measure);
      addMeasureToColumnOrder(self, measure);

      return measure;
    });
  }

  return measure;
}
