import createKeyStore from './createKeyStore';

const [useRpcStore, rpcStore] = createKeyStore({});
const [useRpcRequestStore, rpcRequestStore] = createKeyStore({});

const [useModelChangedStore, modelChangedStore] = createKeyStore({});
const [, modelInitializedStore] = createKeyStore({});

const modelStoreMiddleware = ({ type, value: model }) => {
  // return;
  const initialized = modelInitializedStore.get(model.id);
  if (initialized) {
    // console.log('already initialized', model.id);
    return;
  }
  modelInitializedStore.set(model.id, {});
  const onChanged = () => {
    // console.log('model changed', model.handle, +new Date());
    rpcRequestStore.set(model.id, undefined);
    modelChangedStore.set(model.id, {});
    modelChangedStore.dispatch(true); // Force new state to trigger hooks
  };
  switch (type) {
    case 'SET':
      // console.log('changed listener', model.id);
      model.on('changed', onChanged);
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
