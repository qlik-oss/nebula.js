import type, { clearFromCache } from './type';

const collection = (name, config) => {
  const versions = {};

  const get = (version) => {
    // TODO determine latest version based on semver
    const v = version || Object.keys(versions).sort().slice(-1);
    return versions[v];
  };

  const add = (version, meta) => {
    if (!versions[version]) {
      versions[version] = type({
        name,
        version,
      }, meta, config);
    }
    return get(version);
  };

  return {
    fetch: version => add(version),
    register: (version, meta) => {
      if (versions[version]) {
        throw new Error('Already registered!');
      }
      return add(version, meta);
    },
  };
};

export default function (config) {
  const types = {};

  const fetch = (name, version) => {
    if (!types[name]) {
      types[name] = collection(name, config);
    }
    return types[name].fetch(version);
  };

  return {
    fetch,
    clearFromCache: (name) => {
      if (types[name]) {
        types[name] = undefined;
      }
      clearFromCache(name);
    },
    load: (name, version) => fetch(name, version).load(),
    supernova: (name, version) => fetch(name, version).supernova(),
    // instance: (name, version) => fetch(name, version).instance(),
  };
}
