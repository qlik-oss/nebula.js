/* eslint no-param-reassign: 0 */

const VARIABLE_RX = /\$[A-z0-9.]+/g;

function throwCyclical(s) {
  throw new Error(`Cyclical reference for "${s}"`);
}

function resolveStyle(style, references, replacer) {
  const s = {};

  Object.keys(style).forEach((key) => {
    let value = style[key];
    if (VARIABLE_RX.test(value)) {
      value = value.replace(VARIABLE_RX, replacer);
    }
    s[key] = value;
  });
  return s;
}

function createRefs(obj, s = '', refs) {
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'string') {
      refs[`${s}${key}`] = obj[key];
    } else if (typeof obj[key] === 'object') {
      createRefs(obj[key], `${s}${key}.`, refs);
    }
  });
}

function resolver(theme = {}) {
  const refs = {};
  createRefs(theme, '', refs);
  const replacer = (match) => refs[match.substring(1)];

  function resolveValueReferences(value, path = []) {
    const variables = typeof value === 'string' ? value.match(VARIABLE_RX) : null;
    if (variables && variables.length) {
      variables.forEach((v) => {
        const ref = v.substring(1);
        if (path.indexOf(ref) !== -1) {
          throwCyclical(v);
        }
        const refValue = resolveValueReferences(refs[ref], [...path, ref]);
        value = value.replace(v, refValue);
      });
    }
    return value;
  }

  Object.keys(refs).forEach((key) => {
    refs[key] = resolveValueReferences(refs[key], [key]);
  });

  return {
    get(value) {
      return resolveValueReferences(value);
    },
    resolve(style) {
      return resolveStyle(style, refs, replacer);
    },
    references() {
      return refs;
    },
  };
}

export default resolver;
