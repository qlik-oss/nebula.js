import useOnChange from '../../../hooks/useOnChange';
import useSingleObject from './useSingleObject';

const useSingleObjectProps = (app) => {
  const [model] = useSingleObject(app);
  return useOnChange(model, async (m) => {
    await m.getLayout(true);
    const props = await m.getProperties(true);
    // Return a new object reference so React effects depending on
    return { ...props };
  });
};

export default useSingleObjectProps;
