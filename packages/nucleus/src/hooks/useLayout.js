import {
  useState,
  useEffect,
} from 'react';

const cache = {};

const observe = (model, callback) => {
  let onChanged;
  if (!cache[model.id]) {
    onChanged = () => {
      const c = cache[model.id];
      c.invalid = true;
      model.getLayout().then((lyt) => {
        if (cache[model.id]) {
          cache[model.id].invalid = false;
          cache[model.id].value = lyt;
          cache[model.id].callbacks.forEach(h => h(lyt));
        }
      });
    };
    cache[model.id] = {
      invalid: true,
      value: null,
      callbacks: [],
      stop() {
        model.removeListener('changed', onChanged);
        delete cache[model.id];
      },
    };

    model.on('changed', onChanged);
  }
  cache[model.id].callbacks.push(callback);
  if (onChanged) {
    onChanged();
  } else {
    callback(cache[model.id].value);
  }
};

const unObserve = (model, handler) => {
  if (cache[model.id]) {
    const idx = cache[model.id].callbacks.indexOf(handler);
    if (idx !== 1) {
      cache[model.id].callbacks.splice(idx, 1);
    }

    if (!cache[model.id].callbacks.length) {
      cache[model.id].stop();
    }
  }
};

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
