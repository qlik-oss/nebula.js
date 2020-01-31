import createKeyStore from './createKeyStore';

const [useRpcStore, rpcStore] = createKeyStore({});
const [useRpcRequestStore, rpcRequestStore] = createKeyStore({});

const [useModelChangedStore, modelChangedStore] = createKeyStore({});
const [, modelInitializedStore] = createKeyStore({});

const modelStoreMiddleware = ({ type, value: model }) => {
  // return;
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
        rpcStore.set(model.id, undefined);
        rpcRequestStore.set(model.id, undefined);
        modelChangedStore.set(model.id, undefined);
        modelInitializedStore.set(model.id, undefined);
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
  useRpcStore,
  useRpcRequestStore,
  modelChangedStore,
  rpcRequestStore,
  rpcStore,
};
