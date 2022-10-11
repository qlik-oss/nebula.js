import { useState, useEffect } from 'react';
import { useModelStore } from '../../../stores/model-store';

export default function useExistingModel({ app, qId, options }) {
  const [model, setModel] = useState();
  const [modelStore] = useModelStore();
  const { sessionModel } = options;

  useEffect(() => {
    async function fetchObject() {
      const m = await app.getObject(qId);
      const key = m ? `${m.id}` : null;
      modelStore.set(key, m);
      setModel(m);
    }
    if (sessionModel) {
      setModel(sessionModel);
    } else {
      fetchObject();
    }
  }, []);

  return model;
}
