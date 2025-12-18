import { useState, useEffect } from 'react';

export default function useOnChange(model, getData) {
  const [data, setData] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    let alive = true;

    if (model) {
      const fetchData = async () => {
        try {
          const p = await getData(model);
          if (alive) {
            setError(undefined);
            setData(p);
          }
        } catch (err) {
          setError(err);
          setData(undefined);
        }
      };

      fetchData();

      model.Invalidated.bind(fetchData);
      return () => {
        alive = false;
        model.Invalidated.unbind(fetchData);
      };
    }

    return undefined;
  }, [model && model.id]);

  return [data, error];
}
