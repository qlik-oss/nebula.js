import { useState, useEffect } from 'react';
import { useModelStore } from '../../../hooks/useModelStore';

// Number of mounted consumers per model, so the shared cache entry is only removed by the last one.
const consumers = new WeakMap();

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

    async function fetchModel() {
      const m = await Promise.resolve(sessionModel || fetchObject(qId));
      if (isCleaned) {
        return;
      }
      if (!modelStore.get(m.id)) {
        modelStore.set(m.id, m);
      }
      if (modelStore.get(m.id) === m) {
        consumers.set(m, (consumers.get(m) || 0) + 1);
        const onClosed = () => {
          if (modelStore.get(m.id) === m) {
            modelStore.remove(m.id);
          }
        };
        m.once('closed', onClosed);
        cleanupFn = () => {
          m.removeListener('closed', onClosed);
          const remaining = consumers.get(m) - 1;
          consumers.set(m, remaining);
          // The model can be invalidated without a 'closed' event (e.g. delete + undo recreates the object with
          // the same id), so remove the entry, including its per-model listeners, to let a recreated model be set up anew.
          // Only the last consumer of a model may do so, others still rely on its listeners.
          if (remaining === 0 && modelStore.get(m.id) === m) {
            modelStore.remove(m.id);
          }
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
