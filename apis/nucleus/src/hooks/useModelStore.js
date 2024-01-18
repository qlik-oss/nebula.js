import { useContext } from 'react';
import InstanceContext from '../contexts/InstanceContext';

export function useModelStore() {
  const { useModelStore: useFunc } = useContext(InstanceContext).modelStore;
  return useFunc();
}

export function useModelChangedStore() {
  const { useModelChangedStore: useFunc } = useContext(InstanceContext).modelStore;
  return useFunc();
}

export function useRpcResultStore() {
  const { useRpcResultStore: useFunc } = useContext(InstanceContext).modelStore;
  return useFunc();
}

export function useRpcRequestStore() {
  const { useRpcRequestStore: useFunc } = useContext(InstanceContext).modelStore;
  return useFunc();
}

export function useRpcRequestModelStore() {
  const { useRpcRequestModelStore: useFunc } = useContext(InstanceContext).modelStore;
  return useFunc();
}

export function useRpcRequestSessionModelStore() {
  const { useRpcRequestSessionModelStore: useFunc } = useContext(InstanceContext).modelStore;
  return useFunc();
}
