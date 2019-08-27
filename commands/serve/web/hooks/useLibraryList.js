import useModel from '@nebula.js/nucleus/src/hooks/useModel';
import useLayout from '@nebula.js/nucleus/src/hooks/useLayout';

const D = {
  qInfo: {
    qType: 'DimensionList',
    qId: 'DimensionList',
  },
  qDimensionListDef: {
    qType: 'dimension',
    qData: {
      labelExpression: '/qDimension/qLabelExpression',
      title: '/qMetaDef/title',
    },
  },
};

const M = {
  qInfo: {
    qType: 'MeasureList',
    qId: 'MeasureList',
  },
  qMeasureListDef: {
    qType: 'measure',
    qData: {
      labelExpression: '/qMeasure/qLabelExpression',
      title: '/qMetaDef/title',
    },
  },
};

export default function list(app, type = 'dimension') {
  const def = type === 'dimension' ? D : M;

  const [model] = useModel(def, app);
  const [layout] = useLayout(model, app);
  return [layout ? ((layout.qDimensionList || layout.qMeasureList).qItems || []) : []];
}
