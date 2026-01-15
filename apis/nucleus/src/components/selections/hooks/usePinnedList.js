import { useMemo } from 'react';
import useSingleObject from './useSingleObject';
import useRpc from '../../../hooks/useRpc';

const usePinnedList = (app) => {
  const [model] = useSingleObject(app);
  const [layout] = useRpc(model, 'getLayout');
  return useMemo(() => [layout?.pinnedItems ?? []], [layout]);
};

export default usePinnedList;
