import { generator as SNFactory } from '@nebula.js/supernova';
import { satisfies } from 'semver';
import { load } from './load';

/**
 * @interface TypeInfo
 * @property {string} name
 * @property {string} version
 * @property {LoadType} load
 * @property {object=} meta
 */

export default function create(info, halo, opts = {}) {
  let sn;
  let stringified;
  const { meta } = opts;
  const type = {
    name: info.name,
    version: info.version,
    supportsPropertiesVersion(v) {
      if (v && meta && meta.deps && meta.deps.properties) {
        return satisfies(v, meta.deps.properties);
      }
      return true;
    },
    supernova: () =>
      load(type.name, type.version, halo, opts.load).then((SNDefinition) => {
        sn = sn || SNFactory(SNDefinition, halo.public.galaxy);
        stringified = JSON.stringify(sn.qae.properties.initial);
        return sn;
      }),
    initialProperties(initial) {
      return this.supernova().then(() => {
        const props = {
          qInfo: {
            qType: type.name,
          },
          visualization: type.name,
          version: type.version,
          showTitles: true,
          ...JSON.parse(stringified),
          ...initial,
        };
        return props;
      });
    },
  };

  return type;
}
