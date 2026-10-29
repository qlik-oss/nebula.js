import browserslist from 'browserslist';

// the names of browserslist's browsers, as the transformer of Rolldown (Oxc) calls them
const ENGINES = {
  chrome: 'chrome',
  and_chr: 'chrome',
  edge: 'edge',
  firefox: 'firefox',
  and_ff: 'firefox',
  safari: 'safari',
  ios_saf: 'ios',
  opera: 'opera',
  node: 'node',
  ie: 'ie',
};

// "18.5-18.7" is a range of versions that share their support, the first one is the oldest
const oldestOf = (version) => version.split('-')[0];

const compareVersions = (a, b) => {
  const left = a.split('.').map(Number);
  const right = b.split('.').map(Number);
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i++) {
    const diff = (left[i] || 0) - (right[i] || 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
};

/**
 * The targets for the transform of the code, from a browserslist query: the oldest version of each browser it names.
 * Code that runs in the oldest one runs in the ones that are newer.
 * Browsers that the transformer does not know of (e.g. Samsung Internet) are left out.
 *
 * @param {string | string[]} queries A browserslist query, e.g. `['last 2 Chrome versions', 'Safari >= 11']`.
 * @returns {string[]} e.g. `['chrome62', 'safari11', 'ios12.2']`
 */
export default function getTargets(queries) {
  const oldest = browserslist(queries).reduce((versions, entry) => {
    const [browser, range] = entry.split(' ');
    const engine = ENGINES[browser];
    const version = oldestOf(range);
    if (!engine || !/^\d+(\.\d+)*$/.test(version)) {
      return versions;
    }
    const current = versions.get(engine);
    return !current || compareVersions(version, current) < 0 ? new Map(versions).set(engine, version) : versions;
  }, new Map());

  return [...oldest].map(([engine, version]) => `${engine}${version.replace(/(\.0)+$/, '')}`);
}
