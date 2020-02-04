import init from './initiate';
import { modelStore, rpcRequestModelStore } from '../stores/modelStore';

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
export default async function getObject({ id }, optional, corona) {
  const key = `${id}`;
  let rpc = rpcRequestModelStore.get(key);
  if (!rpc) {
    rpc = corona.app.getObject(id);
    rpcRequestModelStore.set(key, rpc);
  }
  const model = await rpc;
  modelStore.set(key, model);
  return init(model, optional, corona);
}
