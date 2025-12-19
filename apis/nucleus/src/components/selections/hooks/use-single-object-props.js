import useOnChange from './use-on-change';

const useSingleObjectProps = (model) =>
  useOnChange(model, async (m) => {
    await m.getLayout(true);
    const props = await m.getProperties(true);
    // Return a new object reference so React effects depending on
    return { ...props };
  });
export default useSingleObjectProps;
