const noop = () => {};

function fallback(x, value) {
  if (typeof x === 'undefined') {
    return () => value;
  }
  return () => x;
}

function defFn(def = {}) {
  return {
    min: typeof def.min === 'function' ? def.min : fallback(def.min, 0),
    max: typeof def.max === 'function' ? def.max : fallback(def.max, 1000),
    add: def.add || noop,
    description: def.description || noop,
    move: def.move || noop,
    remove: def.remove || noop,
    replace: def.replace || noop,
  };
}

function target(def) {
  return {
    path: def.path || '/qHyperCubeDef',
    dimensions: defFn(def.dimensions),
    measures: defFn(def.measures),
  };
}

export default function qae(def = {}) {
  let initial = def.properties || {};
  let onChange;
  if (def.properties && (def.properties.initial || def.properties.onChange)) {
    initial = def.properties.initial;
    onChange = def.properties.onChange;
  }
  const q = {
    properties: {
      initial,
      onChange,
    },
    data: {
      targets: ((def.data || {}).targets || []).map(target),
    },
  };

  return q;
}
