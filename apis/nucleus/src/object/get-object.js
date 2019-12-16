import init from './initiate';
import { modelStore } from '../stores/modelStore';

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
  const key = `${corona.app.id}/${id}`;
  const model = modelStore.get(key) || modelStore.set(key, await corona.app.getObject(id));
  return init(model, optional, corona);
}
