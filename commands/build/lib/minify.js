import terser from '@rollup/plugin-terser';

// This is a copy of `MINIFY`, `terserLast` and what they need from tools/build/options.mjs of the nebula.js repository,
// which is not a part of any package. Keep them in line.

/**
 * Rolldown's minifier removes code that Terser cannot (it keeps `Ns.x = function () {}` on a local object, and what it
 * refers to), but it prints strings as template literals. That is why the minifier is run without printing whitespace,
 * which leaves the strings as they are, and Terser prints the result. Rolldown minifies after the `renderChunk` hooks
 * of the plugins, so Terser has to run in `generateBundle`, when the minified chunks are final.
 */
export const MINIFY = { compress: true, mangle: false, codegen: { removeWhitespace: false } };

/**
 * Sets the code and the map of a chunk, also in the asset that the source map is written from.
 */
export function setChunk(bundle, chunk, { code, map }) {
  Object.assign(chunk, { code, map });
  const asset = chunk.sourcemapFileName && bundle[chunk.sourcemapFileName];
  if (map && asset) {
    asset.source = JSON.stringify(map);
  }
}

/**
 * The map that Terser returns has the sources it was given, but it has not got the `file` and the `ignoreList` of the
 * map it chained. The sources that are ignored are found again by their path, as the indices have moved.
 */
function withMapFields(map, original) {
  const ignored = new Set((original.ignoreList || []).map((i) => original.sources[i]));
  return {
    ...map,
    ...(original.file ? { file: original.file } : {}),
    ignoreList: map.sources.flatMap((source, i) => (ignored.has(source) ? [i] : [])),
  };
}

/**
 * Minifies the chunks of an output with Terser, after Rolldown has compressed them, see `MINIFY`.
 * @param {object} options
 * @param {string} options.banner Is the preamble of Terser, which removes comments, it is not added by the output.
 * @returns {import('rolldown').Plugin}
 */
export function terserLast({ banner }) {
  return {
    name: 'terser-last',
    async generateBundle(outputOptions, bundle) {
      const chunks = Object.values(bundle).filter((file) => file.type === 'chunk');
      const sourceMap = Boolean(outputOptions.sourcemap);
      await Promise.all(
        chunks.map(async (chunk) => {
          // the map of the chunk is given to Terser, which chains it. One plugin per chunk, as its options are fixed.
          const content = sourceMap && chunk.map ? JSON.parse(JSON.stringify(chunk.map)) : undefined;
          const printer = terser({ output: { preamble: banner }, ...(content ? { sourceMap: { content } } : {}) });
          const result = await printer.renderChunk.call(this, chunk.code, chunk, outputOptions);
          if (result) {
            // Terser drops the comment that refers to the map
            const [url] = chunk.code.match(/^\/\/# sourceMappingURL=.*$/m) || [];
            const code = result.code ?? result;
            setChunk(bundle, chunk, {
              code: url ? `${code}\n${url}` : code,
              // without a map to chain, the map of Terser would map the compressed code only
              map: content && result.map ? withMapFields(result.map, content) : chunk.map,
            });
          }
        })
      );
    },
  };
}
