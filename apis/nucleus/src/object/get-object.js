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

export default function initiate({ id }, optional, context) {
  return context.app.getObject(id).then(model => {
    const viz = vizualizationAPI({
      model,
      context,
    });

    if (optional.options) {
      viz.api.options(optional.options);
    }
    if (optional.context) {
      viz.api.context(optional.context);
    }
    if (optional.element) {
      return viz.api.mount(optional.element).then(() => viz.api);
    }

    return viz.api;
  });
}
