import createKeyStore from './createKeyStore';

const [useRpcResultStore, rpcResultStore] = createKeyStore({});
const [useRpcRequestStore, rpcRequestStore] = createKeyStore({});
const [useRpcRequestSessionModelStore, rpcRequestSessionModelStore] = createKeyStore({});
const [useRpcRequestModelStore, rpcRequestModelStore] = createKeyStore({});

const [useModelChangedStore, modelChangedStore] = createKeyStore({});
const [, modelInitializedStore] = createKeyStore({});

const close = model => {
  rpcResultStore.set(model.id, undefined);
  rpcRequestStore.set(model.id, undefined);
  rpcRequestSessionModelStore.set(model.id, undefined);
  rpcRequestModelStore.set(model.id, undefined);
  modelChangedStore.set(model.id, undefined);
  modelInitializedStore.set(model.id, undefined);
};

const modelStoreMiddleware = ({ type, value: model }) => {
  const initialized = modelInitializedStore.get(model.id);
  if (initialized) {
    return;
  }
  modelInitializedStore.set(model.id, {});
  const onChanged = () => {
    rpcRequestStore.set(model.id, undefined);
    modelChangedStore.set(model.id, {});
    modelChangedStore.dispatch(true); // Force new state to trigger hooks
  };
  switch (type) {
    case 'SET':
      model.on('changed', onChanged);
      model.once('closed', () => {
        model.removeListener('changed', onChanged);
        close(model);
      });
      break;
    default:
      break;
  }
};

const [useModelStore, modelStore] = createKeyStore({}, modelStoreMiddleware);

const subscribe = model => {
  modelStoreMiddleware({ type: 'SET', value: model });
};

export {
  subscribe,
  useModelStore,
  modelStore,
  useModelChangedStore,
  useRpcResultStore,
  rpcResultStore,
  useRpcRequestStore,
  rpcRequestStore,
  useRpcRequestModelStore,
  rpcRequestModelStore,
  useRpcRequestSessionModelStore,
  rpcRequestSessionModelStore,
  modelChangedStore,
};
