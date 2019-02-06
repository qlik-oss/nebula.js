import SNFactory from '@nebula.js/supernova';

const LOADED = {};

const load = ({ name, version }, config) => {
  const key = `${name}__${version}`;
  if (!LOADED[key]) {
    const p = config.load({
      name,
      version,
    }, config.env);
    if (typeof p === 'string') {
      throw new Error('Return value must be a Promise');
    }
    LOADED[key] = p.then((sn) => {
      if (!sn) {
        throw new Error('undefined supernova');
      }
      return sn;
    }).catch((e) => {
      console.error(e);
      throw new Error(`Failed to load supernova: ${name}`);
    });
  }

  return LOADED[key];
};

export function clearFromCache(name) {
  Object.keys(LOADED).forEach((key) => {
    if (key.split('__')[0] === name) {
      LOADED[key] = undefined;
    }
  });
}

export default function (opts, meta, config) {
  let sn;
  const type = {
    name: opts.name,
    version: opts.version,
    /**
     * Initiate load of supernova
     * @returns {Promise<function|SNDefinition>}
     */
    load: () => load(type, config),
    supernova: () => load(type, config)
      .then((SNDefinition) => {
        sn = sn || SNFactory(SNDefinition, config.env);
        return sn;
      }),
    initialProperties(initial) {
      return this.supernova().then((s) => {
        const props = {
          qInfo: {
            qType: 'foobar',
          },
          visualization: type.name,
          version: type.version,
          ...s.qae.properties,
          ...initial,
        };
        return props;
      });
    },
  };

  return type;
}
