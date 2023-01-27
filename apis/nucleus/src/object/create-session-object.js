import populateData from './populator';
import init from './initiate';
import { subscribe, modelStore } from '../stores/model-store';

/**
 * @typedef {string | EngineAPI.INxDimension | EngineAPI.INxMeasure | LibraryField} Field
 */

/**
 * @interface CreateConfig
 * @description Rendering configuration for creating and rendering a new object
 * @extends BaseConfig
 * @property {string} type
 * @property {string=} version
 * @property {(Field[])=} fields
 * @property {boolean} extendProperties Whether to deeply extend properties or not. If false then subtrees will be overwritten.
 * @property {EngineAPI.IGenericObjectProperties=} properties
 * @example
 * // A config for Creating objects:
 * const createConfig = {
 *   type: 'bar',
 *   element: document.querySelector('.bar'),
 *   extendProperties: true,
 *   fields: ['[Country names]', '=Sum(Sales)'],
 *   properties: {
 *     legend: {
 *       show: false,
 *     },
 *   }
 * };
 * nebbie.render(createConfig);
 */
export default async function createSessionObject(
  { type, version, fields, properties, options, plugins, element, extendProperties },
  halo
) {
  let mergedProps = {};
  let error;
  try {
    const t = halo.types.get({ name: type, version });
    mergedProps = await t.initialProperties(properties, extendProperties);
    const sn = await t.supernova();
    if (fields) {
      populateData(
        {
          sn,
          properties: mergedProps,
          fields,
        },
        halo
      );
    }
    if (properties && sn && sn.qae.properties.onChange) {
      sn.qae.properties.onChange.call({}, mergedProps);
    }
  } catch (e) {
    error = e;
    // minimal dummy object properties to allow it to be created
    // and rendered with the error
    mergedProps = {
      qInfo: {
        qType: type,
      },
      visualization: type,
    };
    // console.error(e); // eslint-disable-line
  }
  const model = await halo.app.createSessionObject(mergedProps);
  modelStore.set(model.id, model);
  const unsubscribe = subscribe(model);
  const onDestroy = async () => {
    await halo.app.destroySessionObject(model.id);
    unsubscribe();
  };
  return init(model, { options, plugins, element }, halo, error, onDestroy);
}
