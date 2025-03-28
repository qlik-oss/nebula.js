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
    let isCleaned = false;
    let cleanupFn = () => {};
    async function fetchObject(modelId) {
      const m = modelStore.get(modelId) || (await app.getObject(modelId));
      return m;
    }

    async function awaiter() {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 10000);
      });
    }

    async function fetchModel() {
      await awaiter();
      const m = await Promise.resolve(sessionModel || fetchObject(qId));
      if (isCleaned) {
        return;
      }
      if (!modelStore.get(m.id)) {
        modelStore.set(m.id, m);
        const onClosed = () => {
          modelStore.clear(m.id);
        };
        m.once('closed', onClosed);
        cleanupFn = () => {
          m.removeListener('closed', onClosed);
        };
      }
      setModel(m);
    }
    fetchModel();
    return () => {
      isCleaned = true;
      cleanupFn();
    };
  }, []);

  return model;
}
