import useOnChange from './use-on-change';

const useDimensionLayout = (model) => useOnChange(model, (m) => m.getLayout(true));
export default useDimensionLayout;
