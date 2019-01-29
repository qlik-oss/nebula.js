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
  const q = {
    properties: {
      ...def.properties,
    },
    data: {
      targets: ((def.data || {}).targets || []).map(target),
    },
  };

  return q;
}
