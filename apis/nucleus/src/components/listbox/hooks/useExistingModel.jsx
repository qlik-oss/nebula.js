import { useState, useEffect } from 'react';
import { useModelStore } from '../../../stores/model-store';

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
    async function fetchObject() {
      const modelFromStore = modelStore.get(qId);
      if (modelFromStore) {
        setModel(modelFromStore);
      } else {
        const m = await app.getObject(qId);
        modelStore.set(m.id, m);
        m.once('closed', () => {
          modelStore.clear(m.id);
        });
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
