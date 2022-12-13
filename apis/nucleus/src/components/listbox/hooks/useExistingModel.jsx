import { useState, useEffect } from 'react';
import { useModelStore } from '../../../stores/model-store';

export default function useExistingModel({ app, qId, options = {} }) {
  const [model, setModel] = useState();
  const [modelStore] = useModelStore();
  const { sessionModel } = options;

  const invalidOptions = {
    dense: options.dense,
    frequencyMode: options.frequencyMode,
    checkboxes: options.checkboxes,
    histogram: options.histogram,
  };

  let usedInvalidOption = null;
  Object.entries(invalidOptions).forEach(([key, value]) => {
    if (value) {
      usedInvalidOption = key;
    }
  });

  if (usedInvalidOption) {
    throw new Error(`Option "${usedInvalidOption}" is not applicable for existing objects.`);
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
