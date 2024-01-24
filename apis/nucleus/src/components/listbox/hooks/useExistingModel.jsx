import { useState, useEffect } from 'react';
import { useModelStore } from '../../../hooks/useModelStore';

export default function useExistingModel({ app, qId, options = {} }) {
  const [model, setModel] = useState();
  const [modelStore] = useModelStore();
  const { sessionModel } = options;

  const forbiddenOptions = ['dense', 'frequencyMode', 'checkboxes', 'histogram', 'title', 'stateName', 'listLayout'];
  const usedOptions = Object.keys(options);
  const usedForbiddenOptions = usedOptions.filter((usedOption) => forbiddenOptions.includes(usedOption));

  if (usedForbiddenOptions.length) {
    throw new Error(`Option "${usedForbiddenOptions.join(', ')}" is not applicable for existing objects.`);
  }

  useEffect(() => {
    function storeModel(m) {
      if (modelStore.get(m.id)) {
        return;
      }
      // Nebula gets the model from this store in some of its
      // core functions, so it must always be stored here.
      modelStore.set(m.id, m);
      m.once('closed', () => {
        modelStore.clear(m.id);
      });
    }

    async function fetchObject(modelId) {
      const m = modelStore.get(modelId) || (await app.getObject(modelId));
      return m;
    }

    const p = Promise.resolve(sessionModel || fetchObject(qId));
    p.then((m) => {
      storeModel(m);
      setModel(m);
    });
  }, []);

  return model;
}
