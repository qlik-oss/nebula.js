import useSingleObject from './useSingleObject';
import useRpc from '../../../hooks/useRpc';

const usePinnedList = (app) => {
  const [model] = useSingleObject(app);
  const [layout] = useRpc(model, 'getLayout');
  return [layout?.pinnedItems ?? []];
};

export default usePinnedList;
