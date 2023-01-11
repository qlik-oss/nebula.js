import { useVizDataStore } from '../../../stores/viz-store';

export default function useDataStore(model) {
  const keyPrefix = `${model.id}`;

  const [vizDataStore] = useVizDataStore();

  const setStoreValue = (key, val) => vizDataStore.set(`${keyPrefix}/${key}`, val);
  const getStoreValue = (key) => vizDataStore.get(`${keyPrefix}/${key}`);

  return { setStoreValue, getStoreValue };
}
