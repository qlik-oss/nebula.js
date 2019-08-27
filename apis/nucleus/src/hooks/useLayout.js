import { useState, useEffect } from 'react';

import { observe, unObserve } from '../object/observer';

export default function useLayout(model) {
  const [layout, setLayout] = useState(null);

  useEffect(() => {
    if (!model) {
      return undefined;
    }
    observe(model, setLayout);

    return () => {
      unObserve(model, setLayout);
    };
  }, [model && model.id]);

  return [layout];
}
