import populateData from './populator';

/**
 * @typedef {string | EngineAPI.INxDimension | EngineAPI.INxMeasure | LibraryField} Field
 */

/**
 * @interface CreateConfig
 * @description Rendering configuration for creating and rendering a new object
 * @property {string} type
 * @property {string=} version
 * @property {(Field[])=} fields
 * @property {EngineAPI.IGenericObjectProperties=} properties
 */

export default async function createObject(
  { type, version, fields, properties, extendProperties /* , options, plugins, element */ },
  halo,
  generateOnly,
  store
) {
  let mergedProps = {};
  const children = [];
  const { modelStore } = store;
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
