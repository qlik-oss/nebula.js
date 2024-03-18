import populateData from './populator';
import { modelStore } from '../stores/model-store';

/**
 * @interface UpdateConfig
 * @description Update configuration
 * @property {string|EngineAPI.GenericObject} target object id or enigma model
 * @property {EngineAPI.GenericObjectProperties|EngineAPI.GenericObjectEntry} properties
 * @property {boolean=} [extendProperties=false] For creating objects: Whether to deeply extend properties or not. If false then subtrees will be overwritten.
 * @property {string=} [save=true]
 */

export default async function updateObject(
  { target, properties, extendProperties, save /* , options, plugins, element */ },
  halo
) {
  let mergedProps = {};
  const children = [];
  // let error;
  try {
    const t = halo.types.get({ name: type, version });
    mergedProps = await t.initialProperties(properties, extendProperties);
    const sn = await t.supernova();
    if (fields) {
      await populateData(
        {
          sn,
          properties: mergedProps,
          fields,
          children,
        },
        halo
      );
    }
    if (properties && sn && sn.qae.properties.onChange) {
      sn.qae.properties.onChange.call({}, mergedProps);
    }
  } catch (e) {
    // error = e;
    // minimal dummy object properties to allow it to be created
    // and rendered with the error
    if (!generateOnly) {
      mergedProps = {
        qInfo: {
          qType: type,
        },
        visualization: type,
      };
    } else {
      mergedProps = null;
    }
    // console.error(e); // eslint-disable-line
  }
  if (!generateOnly) {
    const model = await halo.app.createObject(mergedProps);
    if (children.length > 0) {
      await model.setFullPropertyTree({
        qProperty: mergedProps,
        qChildren: children,
      });
    }
    modelStore.set(model.id, model);
    return model;
  }
  return mergedProps;
}
