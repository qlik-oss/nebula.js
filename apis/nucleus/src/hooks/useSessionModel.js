import { useEffect, useState } from 'react';
import { useModelStore, useRpcRequestSessionModelStore } from '../stores/modelStore';

export default function useSessionModel(definition, app, ...deps) {
  const key = app ? `${app.id}/${JSON.stringify(definition)}` : null;
  const [modelStore] = useModelStore();
  const [rpcRequestSessionModelStore] = useRpcRequestSessionModelStore();
  const [model, setModel] = useState();

  let rpcShared;

  if (key) {
    rpcShared = rpcRequestSessionModelStore.get(key);
  }

  useEffect(() => {
    if (!app) {
      return;
    }
    // Create new session object
    const create = async () => {
      if (!rpcShared) {
        const rpc = app.createSessionObject(definition);
        rpcShared = rpc;
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
