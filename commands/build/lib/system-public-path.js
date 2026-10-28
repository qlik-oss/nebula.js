/* eslint-disable camelcase, no-undef */
// First module of a code split systemjs bundle: where the chunks are loaded from.
//
// rspack loads a chunk with a script tag and takes the url of the directory from document.currentScript, which is
// gone by the time a System.register module executes, so the chunks would be requested from the wrong place. A
// System.register module is told its own url, rollup's systemjs output imported its chunks relative to it, and so
// do we.
if (typeof __system_context__ !== 'undefined' && __system_context__ && __system_context__.meta) {
  __webpack_public_path__ = __system_context__.meta.url.replace(/[^/]*$/, '');
}
