import { useState, useEffect } from 'react';

export default function useProperties(model) {
  const [changed, setChanged] = useState(null);
  const [properties, setProperties] = useState(null);
  let canceled = false;

  useEffect(() => {
    if (!model || canceled) return;
    model.getProperties().then((props) => {
      setProperties(props);
    });
  }, [model, changed]);

  useEffect(() => {
    if (!model) {
      return undefined;
    }
    const onChanged = () => {
      setChanged(Date.now());
    };
    model.on('changed', onChanged);
    return () => {
      canceled = true;
      model.removeListener('changed', onChanged);
    };
  }, [model && model.id]);

  return [properties];
}
