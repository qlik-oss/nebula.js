import populateData from './populator';

/**
 * @typedef {object} CreateObjectConfig
 * @property {string} type
 * @property {string} version
 * @property {object[]} fields
 */

export default async function create({ type, version, fields }, optional, context) {
  const t = context.nebbie.types.get({ name: type, version });
  const mergedProps = await t.initialProperties(optional.properties);
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

  const model = await context.app.createSessionObject(mergedProps);
  return context.nebbie.get(
    {
      id: model.id,
    },
    { ...optional, properties: {} }
  );
}
