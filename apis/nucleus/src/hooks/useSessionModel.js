import { useEffect, useState } from 'react';
import { useModelStore, useRpcRequestStore } from '../stores/modelStore';

export default function useSessionModel(definition, app, ...deps) {
  const key = app ? `${app.id}/${JSON.stringify(definition)}` : null;
  const [modelStore] = useModelStore();
  const [requestStore] = useRpcRequestStore();
  const [model, setModel] = useState(modelStore.get(key));

  useEffect(() => {
    if (!app || modelStore.get(key) || requestStore.get(key)) {
      return;
    }
    // Create new session object
    const create = async () => {
      const newModel = await app.createSessionObject(definition);
      modelStore.set(key, newModel);
      setModel(newModel);
    };
    requestStore.set(key, true);
    create();
  }, [app, ...deps]);

  return [model];
}
