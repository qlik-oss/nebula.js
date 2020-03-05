import populateData from './populator';
import init from './initiate';
import { subscribe } from '../stores/modelStore';
/**
 * @typedef {object} CreateConfig
 * @extends BaseConfig
 * @property {string} type
 * @property {string} version
 * @property {object[]} fields
 */
export default async function createSessionObject({ type, version, fields, properties, options, element }, corona) {
  let mergedProps = {};
  let error;
  try {
    const t = corona.public.nebbie.types.get({ name: type, version });
    mergedProps = await t.initialProperties(properties);
    const sn = await t.supernova();
    if (fields) {
      populateData(
        {
          sn,
          properties: mergedProps,
          fields,
        },
        corona
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
  const model = await corona.app.createSessionObject(mergedProps);
  const unsubscribe = subscribe(model);
  const onDestroy = async () => {
    await corona.app.destroySessionObject(model.id);
    unsubscribe();
  };
  return init(model, { options, element }, corona, error, onDestroy);
}
