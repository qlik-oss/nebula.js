import path from 'path';
import { minify as terser } from 'terser';

// a notice that has to stay with the code: @license and @preserve comments and /*! comments
const LEGAL = /@license|@preserve|^\/\*!/;
const BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g;

const normalise = (comment) => comment.replace(/\s+/g, ' ').trim();

// the legal comments of the code, each of them once
const getLegalComments = (code) => {
  const seen = new Map();
  (code.match(BLOCK_COMMENT) || [])
    .filter((comment) => LEGAL.test(comment))
    .forEach((comment) => seen.set(normalise(comment), comment));
  return [...seen.values()];
};

/**
 * How production bundles are minified, in one place.
 *
 * The minifier of Rolldown is not used: it writes strings as template literals (`typeof process==\`object\``), which
 * bundlers that read our bundle do not recognise as guards (a bundler looks for `typeof process === "object"` to leave
 * `process` alone), so they try to polyfill what the bundle only checks for. Terser, which is what minified the
 * bundles before, writes plain strings. It is run when the bundle has been generated, because Rolldown prints the code
 * of a chunk again, with its own style, when a plugin has changed it in `renderChunk`.
 *
 * Legal comments (`@license`, `@preserve`, `/*!`) are kept, once, below the banner. They are collected before the code is
 * minified, as a comment goes with the code it is attached to when that is removed or moved.
 * The source maps are chained with the ones of Rolldown, and the map that is written as a file is the chained one.
 *
 * @param {object} options
 * @param {string} [options.banner] Put at the top of every chunk.
 * @returns {import('rolldown').OutputPlugin}
 */
export default function minify({ banner = '' } = {}) {
  return {
    name: 'nebula-minify',
    async generateBundle(outputOptions, bundle) {
      const chunks = Object.values(bundle).filter((file) => file.type === 'chunk');
      await Promise.all(
        chunks.map(async (chunk) => {
          const legal = getLegalComments(chunk.code);
          const result = await terser(chunk.code, {
            module: outputOptions.format === 'es',
            format: {
              comments: false,
              preamble: `${banner}${legal.length ? `${legal.join('\n')}\n` : ''}` || undefined,
            },
            sourceMap: chunk.map
              ? {
                  content: JSON.stringify(chunk.map),
                  asObject: true,
                  url: chunk.sourcemapFileName ? path.basename(chunk.sourcemapFileName) : undefined,
                }
              : false,
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
