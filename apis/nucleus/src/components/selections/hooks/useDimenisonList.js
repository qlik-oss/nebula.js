import useOnChange from '../../../hooks/useOnChange';

const useDimensionList = (model) =>
  useOnChange(model, async (m) => {
    const layout = await m.getLayout(true);
    return layout?.qDimensionList?.qItems;
  });
export default useDimensionList;
