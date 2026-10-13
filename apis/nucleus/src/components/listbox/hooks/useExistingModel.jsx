import { useState, useEffect } from 'react';
import { useModelStore } from '../../../hooks/useModelStore';

// Per model store: number of mounted consumers of each model whose cache entry was created by this hook, so the
// entry is only removed on unmount by the last one. Entries created elsewhere (e.g. by a rendered visualization) are
// not tracked and not removed on unmount, since their owner still relies on the listeners attached to them.
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
    if (!consumers.has(modelStore)) {
      consumers.set(modelStore, new WeakMap());
    }
    const storeConsumers = consumers.get(modelStore);
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
        storeConsumers.set(m, 0);
      }
      if (modelStore.get(m.id) === m) {
        if (storeConsumers.has(m)) {
          storeConsumers.set(m, storeConsumers.get(m) + 1);
        }
        // A closed model must not stay cached, whoever created the entry.
        const onClosed = () => {
          if (modelStore.get(m.id) === m) {
            storeConsumers.delete(m);
            modelStore.remove(m.id);
          }
        };
        m.once('closed', onClosed);
        cleanupFn = () => {
          m.removeListener('closed', onClosed);
          if (!storeConsumers.has(m)) {
            return;
          }
          const remaining = storeConsumers.get(m) - 1;
          storeConsumers.set(m, remaining);
          // The model can be invalidated without a 'closed' event (e.g. delete + undo recreates the object with
          // the same id), so remove the entry, including its per-model listeners, to let a recreated model be set up anew.
          // Only the last consumer of a model may do so, others still rely on its listeners.
          if (remaining === 0 && modelStore.get(m.id) === m) {
            storeConsumers.delete(m);
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
