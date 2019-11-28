import vizualizationAPI from '../viz';

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
  const model = await context.app.getObject(id);
  const [viz] = vizualizationAPI({
    model,
    context,
  });
  if (optional.element) {
    await viz.mount(optional.element);
  }
  if (optional.options) {
    viz.options(optional.options);
  }
  if (optional.context) {
    viz.context(optional.context);
  }

  return viz;
}
