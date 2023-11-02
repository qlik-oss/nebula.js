import createKeyStore from './create-key-store';

export default function initializeStores(appId) {
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
      rpcRequestStore.clear(model.id);
      modelChangedStore.set(model.id, {});
      modelChangedStore.dispatch(true); // Force new state to trigger hooks
    };
    const unsubscribe = () => {
      model.removeListener('changed', onChanged);
      rpcResultStore.clear(model.id);
      rpcRequestStore.clear(model.id);
      rpcRequestSessionModelStore.clear(model.id);
      rpcRequestModelStore.clear(model.id);
      modelChangedStore.clear(model.id);
      modelInitializedStore.clear(model.id);
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

  const subscribe = (model) => {
    const unsubscribe = modelStoreMiddleware({ type: 'SET', value: model });
    return () => {
      unsubscribe();
      modelStore.clear(model.id);
    };
  };

  return {
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
    appId,
  };
}
