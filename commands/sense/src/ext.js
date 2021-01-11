define(['{{DIST}}', '{{EXT}}'], (supernova, ext) =>
  function supernovaExtension(env) {
    var v = supernova(env);
    v.ext = typeof ext === 'function' ? ext(env) : ext;
    return v;
  });
