import init from './initiate';

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
export default async function initiate({ id }, optional, corona) {
  const cacheKey = `${corona.app.id}/${id}`;
  const model = cache[cacheKey] || (await corona.app.getObject(id));
  cache[cacheKey] = model;
  return init(model, optional, corona);
}
