import {
  useEffect,
  useState,
} from 'react';

const cache = {};

export default function useModel(definition, app, ...deps) {
  const key = app && `${app.id}:${JSON.stringify(definition)}`;
  const [model, setModel] = useState(null);

  useEffect(() => {
    if (!app) {
      return;
    }
    if (!cache[key]) {
      cache[key] = app.createSessionObject(definition);
    }
    cache[key].then(setModel);
  }, [app && key, ...deps]);

  return [model];
}
