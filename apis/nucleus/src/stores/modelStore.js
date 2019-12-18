import createKeyStore from './createKeyStore';

const [useRpcStore] = createKeyStore({});
const [useRpcRequestStore] = createKeyStore({});

const [useLayoutStore, layoutStore] = createKeyStore({});
const [useLayoutRpcStore] = createKeyStore({});
const [useModelChangedStore, modelChangedStore] = createKeyStore({});
const [, modelInitializedStore] = createKeyStore({});

const modelStoreMiddleware = ({ type, value: model }) => {
  const initialized = modelInitializedStore.get(model.id);
  if (initialized) {
    // console.log('already initialized', model.id);
    return;
  }
  modelInitializedStore.set(model.id, {});
  const onChanged = () => {
    modelChangedStore.set(model.id, {});
    const storedState = layoutStore.get(model.id);
    layoutStore.set(model.id, { ...storedState, valid: false, validating: false });
    modelChangedStore.dispatch();
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
  useLayoutRpcStore,
  useLayoutStore,
  useRpcStore,
  useRpcRequestStore,
};
