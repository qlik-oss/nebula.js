import { useEffect, useState } from 'react';
import { useModelStore } from '../stores/modelStore';

export default function useSessionModel(definition, app, ...deps) {
  const key = `${app.id}/${JSON.stringify(definition)}`;
  const [modelStore] = useModelStore();
  const [model, setModel] = useState(modelStore.get(key));

  useEffect(() => {
    if (!app || modelStore.get(key)) {
      return;
    }
    // Create new session object
    const create = async () => {
      const newModel = await app.createSessionObject(definition);
      modelStore.set(key, newModel);
      setModel(newModel);
    };
    create();
  }, [app, ...deps]);

  return [model];
}
