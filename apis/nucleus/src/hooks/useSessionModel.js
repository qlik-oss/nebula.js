import { useEffect, useState } from 'react';
import { useModelStore, useRpcRequestSessionModelStore } from '../stores/model-store';

export default function useSessionModel(definition, app, ...deps) {
  const key = app ? `${app.id}/${JSON.stringify(definition)}` : null;
  const [modelStore] = useModelStore();
  const [rpcRequestSessionModelStore] = useRpcRequestSessionModelStore();
  const [model, setModel] = useState();

  useEffect(() => {
    if (!app) {
      return;
    }
    // Create new session object
    const create = async () => {
      let rpcShared = rpcRequestSessionModelStore.get(key);
      if (!rpcShared) {
        rpcShared = app.createSessionObject(definition);
        rpcRequestSessionModelStore.set(key, rpcShared);
      }
      const newModel = await rpcShared;
      modelStore.set(key, newModel);
      setModel(newModel);
    };
    create();
  }, [app, ...deps]);

  return [model];
}
