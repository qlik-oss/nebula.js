import vizualizationAPI from '../viz';

const cache = {};
/**
 * @typedef {object} GetObjectConfig
 * @property {string} id
 */

/**
 * @typedef {object} VizConfig
 * @property {HTMLElement=} element
 * @property {object=} options
 * @property {object=} context
 * @property {Array<'passive'|'select'|'interact'|'fetch'>} [context.permissions]
 * @property {object=} properties
 */
export default async function initiate({ id }, optional, context) {
  const cacheKey = `${context.app.id}/${id}`;
  const model = cache[cacheKey] || (await context.app.getObject(id));
  const api = vizualizationAPI({
    model,
    context,
  });
  if (optional.element) {
    await api.mount(optional.element);
  }
  if (optional.options) {
    api.options(optional.options);
  }
  if (optional.context) {
    api.context(optional.context);
  }
  cache[cacheKey] = model;
  return api;
}
