import { useEffect, useState } from 'react';
import { useModelStore, useRpcRequestStore } from '../stores/modelStore';

export default function useSessionModel(definition, app, ...deps) {
  const key = app ? `${app.id}/${JSON.stringify(definition)}` : null;
  const [modelStore] = useModelStore();
  const [requestStore] = useRpcRequestStore();
  const [model, setModel] = useState();

  let rpcShared;

  if (key) {
    rpcShared = requestStore.get(key);
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
        requestStore.set(key, rpcShared);
      }
      const newModel = await rpcShared;
      modelStore.set(key, newModel);
      setModel(newModel);
    };
    create();
  }, [app, ...deps]);

  return [model];
}
