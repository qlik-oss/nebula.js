import useRpc from './useRpc';

export default function useProperties(model) {
  return useRpc(model, 'getProperties');
}
