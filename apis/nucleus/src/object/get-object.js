import init from './initiate';
import { modelStore, rpcRequestStore } from '../stores/modelStore';

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
  const key = `${id}`;
  let rpc = rpcRequestStore.get(key);
  if (!rpc) {
    rpc = corona.app.getObject(id);
    rpcRequestStore.set(key, rpc);
  }
  const model = await rpc;
  modelStore.set(key, model);
  return init(model, optional, corona);
}
