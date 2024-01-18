import init from './initiate';
import initSheet from './initiate-sheet';

export default async function getObject({ id, options, plugins, element }, halo, store) {
  const { modelStore, rpcRequestModelStore } = store;
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
