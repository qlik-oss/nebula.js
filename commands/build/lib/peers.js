const escape = (name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * What a bundle leaves out of itself: a package, and the modules of it, as `react` and `react-dom/client`. A
 * regular expression is kept as it is.
 */
export default (externals) =>
  externals.map((external) => (typeof external === 'string' ? new RegExp(`^${escape(external)}(?:/.*)?$`) : external));
