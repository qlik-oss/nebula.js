define(['{{DIST}}', './dist-ext/ext'], function m(supernova, ext) {
  return function supernovaExtension(env) {
    var v = supernova(env);
    v.ext = typeof ext === 'function' ? ext(env) : ext;
    return v;
  };
});
