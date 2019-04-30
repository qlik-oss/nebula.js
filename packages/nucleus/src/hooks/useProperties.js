import {
  useState,
  useEffect,
} from 'react';

import {
  observe,
  unObserve,
} from '../object/observer';

export default function useProperties(model) {
  const [properties, setProperties] = useState(null);

  useEffect(() => {
    if (!model) {
      return undefined;
    }
    observe(model, setProperties, 'properties');

    return () => {
      unObserve(model, setProperties, 'properties');
    };
  }, [model && model.id]);

  return [properties];
}
