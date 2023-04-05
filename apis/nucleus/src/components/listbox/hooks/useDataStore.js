import { useCallback } from 'react';
import { useVizDataStore } from '../../../stores/viz-store';

export default function useDataStore(model) {
  const keyPrefix = `${model.id}`;

  const [vizDataStore] = useVizDataStore();

  const setStoreValue = useCallback(
    (key, val) => {
      vizDataStore.set(`${keyPrefix}/${key}`, val);
    },
    [vizDataStore]
  );
  const getStoreValue = useCallback((key) => vizDataStore.get(`${keyPrefix}/${key}`), [vizDataStore]);

  return { setStoreValue, getStoreValue };
}
