import { useState, useEffect } from 'react';
import { useModelStore } from './useModelStore';

const useModel = (app, qId, props) => {
  const [model, setModel] = useState(undefined);
  const [error, setError] = useState(undefined);
  const [modelStore] = useModelStore();

  useEffect(() => {
    let alive = true;
    let cleanupFn = () => {};

    async function getModel() {
      try {
        const cacheKey = `${app.id}-${qId}`;
        let m = modelStore.get(cacheKey);

        if (!m) {
          try {
            m = await app.getObject(qId);
          } catch (err) {
            if (err.code === 2 && err.message === 'Object not found' && props) {
              // create session object
              m = await app.createSessionObject(props);
            } else {
              throw err;
            }
          }

          if (!alive) {
            return;
          }

          modelStore.set(cacheKey, m);
          const onClosed = () => {
            modelStore.clear(cacheKey);
          };
          m.once('closed', onClosed);
          cleanupFn = () => {
            m.removeListener('closed', onClosed);
          };
        }

        if (alive) {
          setError(undefined);
          setModel(m);
        }
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setModel(undefined);
        }
      }
    }

    if (typeof app?.getObject === 'function') {
      getModel();
      return () => {
        alive = false;
        cleanupFn();
      };
    }

    return undefined;
  }, [app, qId, props, modelStore]);

  return [model, error];
};

export default useModel;
