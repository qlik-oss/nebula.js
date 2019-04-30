import {
  useEffect,
  useState,
} from 'react';

import modelCache, { key } from '../object/model-cache';

export default function useModel(definition, app, ...deps) {
  const k = key(definition, app);
  const [model, setModel] = useState(null);

  useEffect(() => {
    if (!app) {
      return;
    }
    modelCache(definition, app).then(setModel);
  }, [app && k, ...deps]);

  return [model];
}
