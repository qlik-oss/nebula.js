const LOADED = {};

/**
 * @callback loadType
 * @param {object} type
 * @param {string} type.name
 * @param {string} type.version
 * @param {object} env
 * @returns {Promise<Supernova>}
 */

export function load(name, version, config, loader) {
  const key = `${name}__${version}`;
  if (!LOADED[key]) {
    const p = (loader || config.load)(
      {
        name,
        version,
      },
      config.env
    );
    if (typeof p === 'undefined') {
      throw new Error(`Failed to load supernova: ${name}`);
    }
    if (typeof p === 'string') {
      throw new Error('Return value must be a Promise');
    }
    LOADED[key] = p
      .then(sn => {
        if (!sn) {
          throw new Error('undefined supernova');
        }
        return sn;
      })
      .catch(e => {
        console.error(e);
        throw new Error(`Failed to load supernova: ${name}`);
      });
  }

  return LOADED[key];
}

export function clearFromCache(name) {
  Object.keys(LOADED).forEach(key => {
    if (key.split('__')[0] === name) {
      LOADED[key] = undefined;
    }
  });
}
