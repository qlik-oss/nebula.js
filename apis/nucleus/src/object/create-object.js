import populateData from './populator';
import init from './initiate';

/**
 * @typedef {object} CreateObjectConfig
 * @property {string} type
 * @property {string} version
 * @property {object[]} fields
 */

export default async function create({ type, version, fields }, optional, context) {
  let mergedProps = {};
  let error;
  try {
    const t = context.nebbie.types.get({ name: type, version });
    mergedProps = await t.initialProperties(optional.properties);
    const sn = await t.supernova();
    if (fields) {
      populateData(
        {
          sn,
          properties: mergedProps,
          fields,
        },
        context
      );
    }
    if (optional.properties && sn && sn.qae.properties.onChange) {
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

  const model = await context.app.createSessionObject(mergedProps);

  return init(model, optional, context, error);
}
