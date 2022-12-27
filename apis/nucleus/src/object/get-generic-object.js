import init from './initiate';
import initSheet from './initiate-sheet';
import { modelStore, rpcRequestModelStore } from '../stores/model-store';

/**
 * @interface BaseConfig
 * @description Basic rendering configuration for rendering an object
 * @property {HTMLElement} element
 * @property {object=} options
 * @property {Plugin[]} [plugins]
 */

/**
 * @interface GetConfig
 * @description Rendering configuration for rendering an existing object
 * @extends BaseConfig
 * @property {string} id
 */

export default async function getObject({ id, options, plugins, element }, halo) {
  const key = `${id}`;
  let rpc = rpcRequestModelStore.get(key);
  if (!rpc) {
    rpc = halo.app.getObject(id);
    rpcRequestModelStore.set(key, rpc);
  }
  const model = await rpc;
  modelStore.set(key, model);

  if (model.genericType === 'sheet') {
    return initSheet(model, { options, plugins, element }, halo);
  }

  return init(model, { options, plugins, element }, halo);
}
