export const cache = {};

const STATES = {
  VALID: 1,
  INVALID: 2,
  VALIDATING: 3,
  CLOSED: 5,
  CLOSING: 6,
  CANCELLED: 7,
};

const OBSERVABLE = {
  layout: ['getAppLayout', 'getLayout'],
  properties: ['getProperties'],
  effectiveProperties: ['getEffectiveProperties'],
};

const OBSERVABLE_KEYS = Object.keys(OBSERVABLE);

export function unObserve(model, handler, property = 'layout') {
  if (cache[model.id]) {
    const idx = cache[model.id].props[property].callbacks.indexOf(handler);
    if (idx !== 1) {
      cache[model.id].props[property].callbacks.splice(idx, 1);
    }
  }
}

export function observe(model, callback, property = 'layout') {
  if (!OBSERVABLE[property]) {
    throw new Error(`'${property}' is not observable!`);
  }
  if (!cache[model.id]) {
    const onChanged = (filtered) => {
      const c = cache[model.id];
      const affected = [];
      Object.keys(c.props).filter((key) => (filtered ? key === filtered : true)).forEach((key) => {
        c.props[key].state = STATES.INVALID;
        if (c.props[key].callbacks.length) {
          affected.push(key);
        }
      });

      affected.forEach((key) => {
        c.props[key].state = STATES.VALIDATING;
        const method = OBSERVABLE[key].filter((m) => model[m])[0];
        model[method]().then((value) => {
          if (cache[model.id] && cache[model.id].props[key]) {
            if (cache[model.id].props[key].state < STATES.CLOSED && cache[model.id].props[key].state !== STATES.VALID) {
              cache[model.id].props[key].state = STATES.VALID;
              cache[model.id].props[key].value = value;
              cache[model.id].props[key].callbacks.forEach((cb) => cb(value));
            }
          }
        });
      });
    };

    cache[model.id] = {
      onChanged,
      props: {},
    };

    OBSERVABLE_KEYS.forEach((key) => {
      cache[model.id].props[key] = {
        state: STATES.INVALID,
        callbacks: [],
        value: null,
      };
    });

    model.on('changed', onChanged);
    model.once('closed', () => {
      model.removeListener('changed', onChanged);
      delete cache[model.id];
    });
  }
  cache[model.id].props[property].callbacks.push(callback);
  if (cache[model.id].props[property].state === STATES.VALID) {
    callback(cache[model.id].props[property].value);
  } else if (cache[model.id].props[property].state === STATES.INVALID) {
    cache[model.id].onChanged(property);
  }

  return () => {
    unObserve(model, callback, property);
  };
}

export function get(model, property) {
  return new Promise((resolve) => {
    const cb = (value) => {
      unObserve(model, cb, property);
      resolve(value);
    };
    observe(model, cb, property);
  });
}
