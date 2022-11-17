import { useState, useEffect } from 'react';
import { useModelStore } from '../../../stores/model-store';

export default function useExistingModel({ app, qId, options = {} }) {
  const [model, setModel] = useState();
  const [modelStore] = useModelStore();
  const { sessionModel } = options;

  if (options.dense) {
    throw new Error('Option "dense" is not applicable for existing objects.');
  }

  useEffect(() => {
    async function fetchObject() {
      const modelFromStore = modelStore.get(qId);
      if (modelFromStore) {
        setModel(modelFromStore);
      } else {
        const m = await app.getObject(qId);
        modelStore.set(m.id, m);
        setModel(m);
      }
    }
    if (sessionModel) {
      setModel(sessionModel);
    } else {
      fetchObject();
    }
  }, []);

  return model;
}
