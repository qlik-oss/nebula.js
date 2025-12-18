import { useState, useEffect } from 'react';

const useModel = (app, fn) => {
  const [model, setModel] = useState(undefined);
  const [error, setError] = useState(undefined);

  useEffect(() => {
    let alive = true;

    async function getModel() {
      try {
        const m = await app[fn]();
        if (alive) {
          setError(undefined);
          setModel(m);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setModel(undefined);
      }
    }

    if (app?.[fn]) {
      getModel();
      return () => {
        alive = false;
      };
    }

    return undefined;
  }, [app, fn]);

  return [model, error];
};

export default useModel;
