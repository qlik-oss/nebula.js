const escape = (name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * What a bundle leaves out of itself. A SystemJS host resolves a bare name exactly, so a package is left out as
 * itself and `react/jsx-runtime` is bundled unless the host lists it. An es module bundle also leaves out the modules
 * of a package, as `react-dom/client` of `react-dom`, so that a second copy of it is not bundled. A regular
 * expression is kept as it is.
 */
export default (externals, format) =>
  externals.map((external) =>
    typeof external === 'string' ? new RegExp(`^${escape(external)}${format === 'esm' ? '(?:/.*)?' : ''}$`) : external
  );

export const isExternal = (externals, id) =>
  externals.some((external) => (typeof external === 'string' ? external === id : external.test(id)));
