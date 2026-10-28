// Entry for the umd builds, see the umd entry note in rspack.config.mjs.
// Copying the exports into a plain object leaves out the non-enumerable __esModule marker
// that rspack puts on an esm entry, so the bundle looks like rollup's umd output to consumers.
// eslint-disable-next-line import/no-unresolved -- aliased to the package's src/index by rspack.config.mjs
module.exports = Object.assign({}, require('__nebula_umd_target__'));
