// Entry for the extension definition bundle, see build.js.
//
// Rollup's amd output returns the default export when it is the only export and an object with the named
// exports otherwise. rspack would return the esm namespace object of the entry, which would hide a lone
// default export behind `.default` for src/ext.js.
// eslint-disable-next-line import/no-unresolved -- aliased to the extension definition by build.js
const entry = require('__nebula_sense_ext__');

function normalise(exported) {
  if (typeof exported === 'function' || exported === null || typeof exported !== 'object') {
    return exported;
  }
  const keys = Object.keys(exported);
  if (keys.length === 1 && keys[0] === 'default') {
    return exported.default;
  }
  const copy = { ...exported };
  if (keys.indexOf('default') !== -1) {
    Object.defineProperty(copy, '__esModule', { value: true });
  }
  return copy;
}

module.exports = normalise(entry);
