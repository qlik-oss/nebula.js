import useRpc from './useRpc';

export default function useLayout(model) {
  const [layout, { validating, canCancel, canRetry }, longrunning] = useRpc(model, 'getLayout');
  if (model?.pureLayout) {
    return [model.pureLayout, { validating, canCancel, canRetry }, longrunning];
  }
  return [layout, { validating, canCancel, canRetry }, longrunning];
}

export function useAppLayout(model) {
  return useRpc(model, 'getAppLayout');
}
