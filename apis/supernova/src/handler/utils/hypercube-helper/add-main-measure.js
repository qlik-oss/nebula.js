import { insertMainMeasure } from './hypercube-utils';

export default function addMainMeasure(self, measure, index) {
  const measures = self.getMeasures();
  const idx = index ?? measures.length;

  if (measures.length < self.maxMeasures()) {
    insertMainMeasure(measure, measures, idx);
  }

  return measure;
}
