define(['{{DIST}}', '{{EXT}}'], (supernova, ext) =>
  function supernovaExtension(env) {
    var v = supernova(env);
    var extDef = ext;
    /* eslint no-underscore-dangle:0 */
    if (ext.__esmodule === true) {
      // Handles es modules with multiple exports
      extDef = ext.default;
    }
    v.ext = typeof extDef === 'function' ? extDef(env) : extDef;
    return v;
  });
