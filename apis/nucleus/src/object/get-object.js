import init from './initiate';
import { modelStore, rpcRequestModelStore } from '../stores/modelStore';

/**
 * @interface BaseConfig
 * @property {HTMLElement=} element
 * @property {object=} optional
 * @property {object=} optional.options
 * @property {object=} optional.properties
 */

/**
 * @interface GetConfig
 * @extends BaseConfig
 * @property {string} id
 */

export default async function getObject({ id, options, element }, corona) {
  const key = `${id}`;
  let rpc = rpcRequestModelStore.get(key);
  if (!rpc) {
    rpc = corona.app.getObject(id);
    rpcRequestModelStore.set(key, rpc);
  }
  const model = await rpc;
  modelStore.set(key, model);
  return init(model, { options, element }, corona);
}
