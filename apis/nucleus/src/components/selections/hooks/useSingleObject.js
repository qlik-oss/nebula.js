import { useState, useEffect } from 'react';
import { useModelStore } from '../../../hooks/useModelStore';
import { getSinglePublicObject, SINGLE_OBJECT_ID } from '../single-public';

const useSingleObject = (app) => {
  const [singleObject, setSingleObject] = useState(null);
  const [error, setError] = useState(null);
  const [modelStore] = useModelStore();

  useEffect(() => {
    let alive = true;
    let cleanupFn = () => {};

    async function getSingleObject() {
      try {
        const cacheKey = `${app.id}-${SINGLE_OBJECT_ID}`;
        let model = modelStore.get(cacheKey);

        if (!model) {
          model = await getSinglePublicObject(app, SINGLE_OBJECT_ID);
          if (!alive) {
            return;
          }

          if (model) {
            modelStore.set(cacheKey, model);
            const onClosed = () => {
              modelStore.clear(cacheKey);
            };
            model.once('closed', onClosed);
            cleanupFn = () => {
              model.removeListener('closed', onClosed);
            };
          }
        }

        if (alive) {
          setError(null);
          setSingleObject(model);
        }
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setSingleObject(null);
        }
      }
    }

    if (app) {
      getSingleObject();
      return () => {
        alive = false;
        cleanupFn();
      };
    }

    return undefined;
  }, [app, modelStore]);

  return [singleObject, error];
};

export default useSingleObject;
