import { getRemainedFields } from './hypercube-utils';

function removeAlternativeMeasure(self, indexes) {
  const current = self;
  const measures = current.getAlternativeMeasures();
  const remainedFields = getRemainedFields(measures, indexes);
  current.hcProperties.qLayoutExclude.qHyperCubeDef.qMeasures = remainedFields;
}

export default removeAlternativeMeasure;
