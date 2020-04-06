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

export function typeCollection(name, corona) {
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
        corona,
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

export function create({ corona, parent }) {
  const tc = {};

  const p = parent || {
    get: () => undefined,
  };

  return {
    register: (typeInfo, opts) => {
      if (!tc[typeInfo.name]) {
        tc[typeInfo.name] = typeCollection(typeInfo.name, corona);
      }
      tc[typeInfo.name].register(typeInfo.version, opts);
    },
    getSupportedVersion: (name, propertyVersion) => {
      if (!tc[name]) {
        return null;
      }
      return tc[name].getMatchingVersionFromProperties(propertyVersion);
    },
    get(typeInfo) {
      const { name, version } = typeInfo;
      if (!tc[name] || !tc[name].versions[version]) {
        this.register({ name, version });
      }
      return tc[name].get(version) || p.get(typeInfo);
    },
    clearFromCache: (name) => {
      if (tc[name]) {
        tc[name] = undefined;
      }
      clearFromCache(name);
    },
  };
}
