import useRpc from './useRpc';
import { useModelStore } from '../stores/modelStore';

export default function usePropertiesById(id) {
  const [modelStore] = useModelStore();
  const model = modelStore.get(id);
  const [properties, ...rest] = useRpc(model, 'getProperties');
  return [properties, (p) => model.setProperties(p), ...rest];
}
