const LOADED = {};

/**
 * @callback loadType
 * @param {object} type
 * @param {string} type.name
 * @param {string} type.version
 * @param {object} env
 * @returns {Promise<Supernova>}
 */

export async function load(name, version, corona, loader) {
  const key = `${name}__${version}`;
  if (!LOADED[key]) {
    const sKey = `${name}${(version && ` v${version}`) || ''}`;
    const p = (loader || corona.config.load)(
      {
        name,
        version,
      },
      corona.public.env
    );
    const prom = Promise.resolve(p);
    LOADED[key] = prom
      .then(sn => {
        if (!sn) {
          // TODO - improve validation
          throw new Error(`load() of supernova '${sKey}' resolved to an invalid object`);
        }
        return sn;
      })
      .catch(e => {
        corona.logger.warn(e);
        throw new Error(`Failed to load supernova: '${sKey}'`);
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
