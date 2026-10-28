// Entry for the umd bundles, see config.js.
//
// Rollup's umd output exposes the default export as the module itself when it is the only export
// (`module.exports = fn`) and the named exports on an object otherwise, with no __esModule marker.
// rspack would wrap the exports of an esm entry in a namespace object that is marked __esModule,
// which makes `import viz from 'viz'` resolve to undefined in consumers that default-import the
// bundle. Normalise the entry's exports to what rollup produced.
// eslint-disable-next-line import/no-unresolved -- aliased to the package's src/index by config.js
const entry = require('__nebula_build_entry__');

function normalise(exported) {
  if (typeof exported === 'function' || exported === null || typeof exported !== 'object') {
    return exported;
  }
  const keys = Object.keys(exported);
  if (keys.length === 1 && keys[0] === 'default') {
    return exported.default;
  }
  const copy = { ...exported };
  // rollup marks an export object that has a default next to named exports, so that a default import of
  // the bundle gets the default export; one without a default is left unmarked
  if (keys.indexOf('default') !== -1) {
    Object.defineProperty(copy, '__esModule', { value: true });
  }
  return copy;
}

module.exports = normalise(entry);
