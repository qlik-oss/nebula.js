import init from './initiate';
import { modelStore, rpcRequestModelStore } from '../stores/model-store';

export default async function getObject({ id, options, plugins, element }, halo) {
  const key = `${id}`;
  let rpc = rpcRequestModelStore.get(key);
  if (!rpc) {
    rpc = halo.app.getObject(id);
    rpcRequestModelStore.set(key, rpc);
  }
  const model = await rpc;
  modelStore.set(key, model);

  return init(model, { options, plugins, element }, halo);
}
