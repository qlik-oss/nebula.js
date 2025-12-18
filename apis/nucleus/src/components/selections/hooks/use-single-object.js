import { useState, useEffect } from 'react';
import { getSinglePublicObject, SINGLE_OBJECT_ID } from '../single-public';

const useSingleObject = (app) => {
  const [singleObject, setSingleObject] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    async function getSingleObject() {
      try {
        const model = await getSinglePublicObject(app, SINGLE_OBJECT_ID);
        if (alive) {
          setError(null);
          setSingleObject(model);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setSingleObject(null);
      }
    }

    if (app) {
      getSingleObject();
      return () => {
        alive = false;
      };
    }

    return undefined;
  }, [app]);

  return [singleObject, error];
};

export default useSingleObject;
