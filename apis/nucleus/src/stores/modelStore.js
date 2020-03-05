import createKeyStore from './createKeyStore';

const [useRpcResultStore, rpcResultStore] = createKeyStore({});
const [useRpcRequestStore, rpcRequestStore] = createKeyStore({});
const [useRpcRequestSessionModelStore, rpcRequestSessionModelStore] = createKeyStore({});
const [useRpcRequestModelStore, rpcRequestModelStore] = createKeyStore({});

const [useModelChangedStore, modelChangedStore] = createKeyStore({});
const [, modelInitializedStore] = createKeyStore({});

const modelStoreMiddleware = ({ type, value: model }) => {
  const initialized = modelInitializedStore.get(model.id);
  modelInitializedStore.set(model.id, {});
  const onChanged = () => {
    rpcRequestStore.set(model.id, undefined);
    modelChangedStore.set(model.id, {});
    modelChangedStore.dispatch(true); // Force new state to trigger hooks
  };
  const unsubscribe = () => {
    model.removeListener('changed', onChanged);
    rpcResultStore.set(model.id, undefined);
    rpcRequestStore.set(model.id, undefined);
    rpcRequestSessionModelStore.set(model.id, undefined);
    rpcRequestModelStore.set(model.id, undefined);
    modelChangedStore.set(model.id, undefined);
    modelInitializedStore.set(model.id, undefined);
  };
  switch (type) {
    case 'SET':
      if (!initialized) {
        model.on('changed', onChanged);
        model.once('closed', () => {
          unsubscribe();
        });
      }
      break;
    default:
      break;
  }
  return unsubscribe;
};

const [useModelStore, modelStore] = createKeyStore({}, modelStoreMiddleware);

const subscribe = model => {
  return modelStoreMiddleware({ type: 'SET', value: model });
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
