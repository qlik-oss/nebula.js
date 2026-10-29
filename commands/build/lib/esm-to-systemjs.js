import path from 'path';
import { rollup } from 'rollup';

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

// This is a copy of tools/build/esm-to-systemjs.mjs of the nebula.js repository, which is not a part of any package.
// Keep them in line.

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
 * @param {string} options.outDir The directory the chunks are written to, the `fileName`s are relative to it.
 * @param {EsmChunk[]} options.chunks
 * @param {string} [options.banner] Added at the top of every converted chunk.
 * @param {(warning: { message: string }) => void} [options.onwarn] Gets the warnings of Rollup, which are logged by default.
 * @param {boolean} [options.sourcemap=true] Produce a source map per chunk, chained with the input map. A chunk that has
 *   no map in the input gets none: a map of the conversion alone would point at the ES code, which is not written.
 * @returns {Promise<SystemChunk[]>} In the same order as `chunks`.
 */
export default async function esmToSystemJs({
  outDir,
  chunks,
  banner = '',
  sourcemap = true,
  // eslint-disable-next-line no-console
  onwarn = (warning) => console.warn(warning.message),
}) {
  const root = path.resolve(outDir);

  // Every conversion is let to finish, and to close its build, before a failure is thrown
  const results = await Promise.allSettled(
    chunks.map(async ({ fileName, code, map }) => {
      const entry = path.join(root, fileName);

      const build = await rollup({
        input: entry,
        // the code is already bundled, there is nothing left to tree shake
        treeshake: false,
        onwarn,
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
          // what Rollup ignores by default, and the modules that Rolldown makes up
          sourcemapIgnoreList: (source) => /node_modules|builtin:/.test(source),
        });
        const [chunk] = output;
        return { fileName, code: chunk.code, map: chunk.map ? JSON.parse(JSON.stringify(chunk.map)) : null };
      } finally {
        await build.close();
      }
    })
  );

  const failed = results.find((result) => result.status === 'rejected');
  if (failed) {
    throw failed.reason;
  }
  return results.map((result) => result.value);
}

/**
 * A Rolldown plugin that converts the chunks of the ES bundle to SystemJS, after they have been generated, and keeps the
 * source maps that are written in line with the converted code.
 * @param {object} options
 * @param {string} [options.banner] Added at the top of every chunk.
 * @returns {import('rolldown').Plugin}
 */
export function systemJs({ banner = '' } = {}) {
  return {
    name: 'esm-to-systemjs',
    async generateBundle(outputOptions, bundle) {
      const chunks = Object.values(bundle).filter((file) => file.type === 'chunk');
      const converted = await esmToSystemJs({
        banner,
        // surfaced like the warnings of Rolldown
        onwarn: (warning) => this.warn(warning.message),
        outDir: outputOptions.dir || path.dirname(outputOptions.file),
        sourcemap: Boolean(outputOptions.sourcemap),
        chunks: chunks.map(({ fileName, code, map }) => ({ fileName, code, map })),
      });
      converted.forEach(({ fileName, code, map }) => {
        const chunk = bundle[fileName];
        Object.assign(chunk, { code, map });
        // The source map is written from an asset of its own, which is not made from `chunk.map` again
        const asset = chunk.sourcemapFileName && bundle[chunk.sourcemapFileName];
        if (map && asset) {
          asset.source = JSON.stringify(map);
        }
      });
    },
  };
}
