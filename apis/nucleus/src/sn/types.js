import type from './type';
import { clearFromCache } from './load';

export function semverSort(arr) {
  const unversioned = arr.filter((v) => v === 'undefined');
  return [
    ...unversioned,
    ...arr
      .filter((v) => v !== 'undefined')
      .map((v) => v.split('.').map((n) => parseInt(n, 10)))
      .sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
      .map((n) => n.join('.')),
  ];
}

export function typeCollection(name, halo) {
  const versions = {};
  let sortedVersions = null;

  return {
    get: (version) => versions[version],
    register: (version, opts) => {
      if (versions[version]) {
        throw new Error(`Supernova '${name}@${version}' already registered.`);
      }

      versions[version] = type(
        {
          name,
          version,
        },
        halo,
        opts
      );
      sortedVersions = null;
    },
    getMatchingVersionFromProperties: (propertyVersion) => {
      if (!sortedVersions) {
        sortedVersions = semverSort(Object.keys(versions));
      }
      for (let i = sortedVersions.length - 1; i >= 0; i--) {
        const t = versions[sortedVersions[i]];
        if (t.supportsPropertiesVersion(propertyVersion)) {
          return sortedVersions[i];
        }
      }
      return null;
    },
    versions,
  };
}

export function create({ halo, parent }) {
  const tc = {};

  const p = parent || {
    get: () => undefined,
  };

  return {
    register: (typeInfo, opts) => {
      if (!tc[typeInfo.name]) {
        tc[typeInfo.name] = typeCollection(typeInfo.name, halo);
      }
      tc[typeInfo.name].register(typeInfo.version, opts);
    },
    getSupportedVersion: (name, propertyVersion) => {
      if (!tc[name]) {
        return undefined;
      }
      return tc[name].getMatchingVersionFromProperties(propertyVersion);
    },
    get(typeInfo) {
      const { name } = typeInfo;
      let { version } = typeInfo;
      if (!tc[name]) {
        // Chart not registered, so we'll do that now.
        if (__NEBULA_DEV__) {
          console.warn(`Visualization ${name} is not registered. Adding it now.`); // eslint-disable-line no-console
        }
        this.register({ name, version });
      } else if (!tc[name].versions[version]) {
        // Fall back to existing version
        const versionToUse = Object.keys(tc[name].versions)[0];
        if (__NEBULA_DEV__) {
          console.warn(`Version ${version} of ${name} is not registered. Falling back to version ${versionToUse}`); // eslint-disable-line no-console
        }
        version = versionToUse;
      }
      return tc[name].get(version) || p.get(typeInfo);
    },
    getList: () =>
      Object.keys(tc).map((key) => ({
        name: key,
        versions: Object.keys(tc[key].versions).map((v) => (v === 'undefined' ? undefined : v)),
      })),
    clearFromCache: (name) => {
      if (tc[name]) {
        tc[name] = undefined;
      }
      clearFromCache(name);
    },
  };
}
