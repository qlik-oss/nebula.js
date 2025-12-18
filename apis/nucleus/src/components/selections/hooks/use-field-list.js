import useOnChange from './use-on-change';

const useFieldList = (model) => useOnChange(model, (m) => m.expand());
export default useFieldList;
