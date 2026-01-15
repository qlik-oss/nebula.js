import { useMemo } from 'react';
import useModel from '../../../hooks/useModel';
import useRpc from '../../../hooks/useRpc';

const dimensionListProps = {
  qInfo: {
    qId: 'DimensionList',
    qType: 'DimensionList',
  },
  qDimensionListDef: {
    qType: 'dimension',
    qData: {
      title: '/qMetaDef/title',
      tags: '/qMetaDef/tags',
      grouping: '/qDim/qGrouping',
      info: '/qDimInfos',
      labelExpression: '/qDim/qLabelExpression',
    },
  },
};

const useDimensionList = (app) => {
  const [model] = useModel(app, 'DimensionList', dimensionListProps);
  const [layout] = useRpc(model, 'getLayout');
  return useMemo(() => [layout?.qDimensionList?.qItems], [layout]);
};

export default useDimensionList;
