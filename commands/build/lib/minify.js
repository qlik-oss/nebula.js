import { minify as terser } from 'terser';

/**
 * How production bundles are minified, in one place.
 *
 * The minifier of Rolldown is not used: it writes strings as template literals (`typeof process==\`object\``), which
 * bundlers that read our bundle do not recognise as guards (a bundler looks for `typeof process === "object"` to leave
 * `process` alone), so they try to polyfill what the bundle only checks for. Terser, which is what minified the
 * bundles before, writes plain strings. It is run when the bundle has been generated, because Rolldown prints the code
 * of a chunk again, with its own style, when a plugin has changed it in `renderChunk`.
 *
 * Legal comments (`@license`, `@preserve`, `/*!`) are kept by Terser, and the banner is its preamble.
 * The source maps are chained with the ones of Rolldown, and the map that is written as a file is the chained one.
 *
 * @param {object} options
 * @param {string} [options.banner] Put at the top of every chunk.
 * @returns {import('rolldown').OutputPlugin}
 */
export default function minify({ banner } = {}) {
  return {
    name: 'nebula-minify',
    async generateBundle(outputOptions, bundle) {
      const chunks = Object.values(bundle).filter((file) => file.type === 'chunk');
      await Promise.all(
        chunks.map(async (chunk) => {
          const result = await terser(chunk.code, {
            module: outputOptions.format === 'es',
            output: { preamble: banner },
            sourceMap: chunk.map ? { content: JSON.stringify(chunk.map), asObject: true } : false,
          });
          const map = result.map ? { ...result.map } : null;
          Object.assign(chunk, { code: result.code, map });
          // The source map is written from an asset of its own, which is not made from `chunk.map` again
          const asset = chunk.sourcemapFileName && bundle[chunk.sourcemapFileName];
          if (map && asset) {
            asset.source = JSON.stringify(map);
          }
        })
      );
    },
  };
}
