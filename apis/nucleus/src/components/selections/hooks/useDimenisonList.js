import useOnChange from '../../../hooks/useOnChange';
import useModel from '../../../hooks/useModel';

const useDimensionList = (app) => {
  const [model] = useModel(app, 'DimensionList');
  return useOnChange(model, async (m) => {
    const layout = await m.getLayout(true);
    return layout?.qDimensionList?.qItems;
  });
};

export default useDimensionList;
