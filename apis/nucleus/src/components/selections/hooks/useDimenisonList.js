import useOnChange from '../../../hooks/useOnChange';
import useModel from '../../../hooks/useModel';

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
  return useOnChange(model, async (m) => {
    const layout = await m.getLayout(true);
    return layout?.qDimensionList?.qItems;
  });
};

export default useDimensionList;
