const noop = () => {};

/**
 * @interface QAEDefinition
 * @property {qae.GenericObjectProperties=} properties
 * @property {object=} data
 * @property {DataTarget[]} data.targets
 */

/**
 * @interface DataTarget
 * @property {string} path
 * @property {FieldTarget<qae.NxDimension>=} dimensions
 * @property {FieldTarget<qae.NxMeasure>=} measures
 */

/**
 * @interface FieldTarget
 * @template T
 * @property {function():number} [min]
 * @property {function():number} [max]
 * @property {function(T, qae.GenericObjectProperties)} [added]
 * @property {function(T, qae.GenericObjectProperties, number)} [removed]
 */

function fallback(x, value) {
  if (typeof x === 'undefined') {
    return () => value;
  }
  return () => x;
}

function defFn(input) {
  const def = input || {};
  return {
    min: typeof def.min === 'function' ? def.min : fallback(def.min, 0),
    max: typeof def.max === 'function' ? def.max : fallback(def.max, 1000),
    added: def.added || def.add || noop, // TODO - deprecate add in favour of added
    description: def.description || noop,
    moved: def.moved || def.move || noop,
    removed: def.removed || def.remove || noop,
    replaced: def.replaced || def.replace || noop,
    isDefined: () => !!input,
  };
}

const resolveValue = (data, reference, defaultValue) => {
  const steps = reference.split('/');
  let dataContainer = data;
  if (dataContainer === undefined) {
    return defaultValue;
  }
  for (let i = 0; i < steps.length; ++i) {
    if (steps[i] === '') {
      continue; // eslint-disable-line no-continue
    }
    if (typeof dataContainer[steps[i]] === 'undefined') {
      return defaultValue;
    }
    dataContainer = dataContainer[steps[i]];
  }

  return dataContainer;
};

function target(def) {
  const propertyPath = def.path || '/qHyperCubeDef';
  const layoutPath = propertyPath.slice(0, -3);
  if (/\/qHyperCube$/.test(layoutPath) === false) {
    throw new Error(`Incorrect definition for qHyperCubeDef at ${propertyPath}`);
  }
  return {
    propertyPath,
    layoutPath,
    resolveLayout: (layout) => {
      return resolveValue(layout, layoutPath, {});
    },
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
