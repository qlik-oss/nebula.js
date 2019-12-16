import useRpc from './useRpc';

export default function useLayout(model) {
  return useRpc(model, 'getLayout');
}

export function useAppLayout(model) {
  return useRpc(model, 'getAppLayout');
}
