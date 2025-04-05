// It splits measures array into deleted and remaining based on the provided indexes

import { splitMeasures } from './hypercube-utils';

// and it returns the deleted measures.
export default function removeAlternativeMeasure(self, indexes) {
  const current = self;
  const [deletedMeasures, remainingMeasures] = splitMeasures(current, indexes);
  current.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures = remainingMeasures;
  return deletedMeasures;
}
