import path from 'node:path';

/**
 * @typedef {object} EsmChunk
 * @property {string} fileName Path of the chunk relative to the output directory, e.g. `chunks/index-abc.js`.
 * @property {string} code ES module source of the chunk.
 * @property {object | null} [map] Source map of the chunk, where `sources` are relative to the chunk's own directory.
 */

/**
 * @typedef {object} SystemChunk
 * @property {string} fileName
 * @property {string} code `System.register` source of the chunk.
 * @property {object | null} map Source map that chains through the map of the input chunk.
 */

/**
 * Converts the chunks of a code split ES bundle to SystemJS modules, one `System.register` per chunk.
 *
 * Every chunk is converted on its own with Rollup, where the sibling chunks are external. Imports between the chunks
 * therefore stay as dependencies of `System.register`, with the same relative specifiers as in the ES output.
 * Nothing is written to disk: the chunks are served to Rollup through virtual modules that are placed at the location
 * of the output files, so that the relative `sources` in the source maps resolve to the files they refer to, and
 * relative imports resolve as they did in the input.
 *
 * @param {object} options
 * @param {typeof import('rollup').rollup} options.rollup The `rollup` function.
 * @param {string} options.outDir The directory the chunks are written to, the `fileName`s are relative to it.
 * @param {EsmChunk[]} options.chunks
 * @param {string} [options.banner] Added at the top of every converted chunk.
 * @param {boolean} [options.sourcemap=true] Produce a source map per chunk, chained with the input map. A chunk that has
 *   no map in the input gets none: a map of the conversion alone would point at the ES code, which is not written.
 * @returns {Promise<SystemChunk[]>} In the same order as `chunks`.
 */
export default async function esmToSystemJs({ rollup, outDir, chunks, banner = '', sourcemap = true }) {
  const root = path.resolve(outDir);

  return Promise.all(
    chunks.map(async ({ fileName, code, map }) => {
      const entry = path.join(root, fileName);

      const build = await rollup({
        input: entry,
        // the code is already bundled, there is nothing left to tree shake
        treeshake: false,
        onwarn: () => {},
        plugins: [
          {
            name: 'esm-to-systemjs',
            resolveId(source) {
              // The imports stay as they are written: the sibling chunks, and what is external to the bundle. An
              // absolute external id is not turned into a path that is relative to Rollup's idea of an input directory.
              return source === entry ? entry : { id: source, external: 'absolute' };
            },
            load(id) {
              return id === entry ? { code, map: map || null } : null;
            },
          },
        ],
      });

      try {
        const { output } = await build.generate({
          dir: root,
          entryFileNames: fileName,
          format: 'system',
          banner,
          sourcemap: sourcemap && Boolean(map),
        });
        const [chunk] = output;
        return { fileName, code: chunk.code, map: chunk.map ? JSON.parse(JSON.stringify(chunk.map)) : null };
      } finally {
        await build.close();
      }
    })
  );
}
