import init from './initiate';
import { modelStore } from '../stores/modelStore';

/**
 * @typedef {object} GetObjectConfig
 * @property {string} id
 */

/**
 * @typedef {object} VizConfig
 * @property {HTMLElement=} element
 * @property {object=} optional
 * @property {object=} optional.options
 * @property {object=} optional.properties
 */
export default async function initiate({ id }, optional, corona) {
  const key = `${corona.app.id}/${id}`;
  const model = modelStore.get(key) || modelStore.set(key, await corona.app.getObject(id));
  return init(model, optional, corona);
}
