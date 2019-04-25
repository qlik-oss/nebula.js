export const cache = {};

const STATES = {
  VALID: 1,
  INVALID: 2,
  VALIDATING: 3,
  CLOSED: 5,
  CLOSING: 6,
  CANCELLED: 7,
};

export function observe(model, callback) {
  let onChanged;
  if (!cache[model.id]) {
    onChanged = () => {
      const c = cache[model.id];
      c.state = STATES.INVALID;
      if (c.callbacks.length) {
        c.state = STATES.VALIDATING;
        model.getLayout().then((layout) => {
          if (cache[model.id]) {
            if (cache[model.id].state < STATES.CLOSED) {
              cache[model.id].state = STATES.VALID;
              cache[model.id].value = layout;
              cache[model.id].callbacks.forEach(h => h(layout));
            }
          }
        });
      }
    };
    cache[model.id] = {
      state: STATES.INVALID,
      value: null,
      callbacks: [],
    };

    model.on('changed', onChanged);
    model.once('closed', () => {
      model.removeListener('changed', onChanged);
      delete cache[model.id];
    });
  }
  cache[model.id].callbacks.push(callback);
  if (cache[model.id].state === STATES.VALID) {
    callback(cache[model.id].value);
  } else if (cache[model.id].state === STATES.INVALID) {
    onChanged();
  }
}

export function unObserve(model, handler) {
  if (cache[model.id]) {
    const idx = cache[model.id].callbacks.indexOf(handler);
    if (idx !== 1) {
      cache[model.id].callbacks.splice(idx, 1);
    }
  }
}
