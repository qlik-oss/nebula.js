import createKeyStore from './createKeyStore';

const [useRpcStore] = createKeyStore({});
const [useRpcRequestStore, requestStore] = createKeyStore({});

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
    // console.log('model changed');
    requestStore.set(model.id, undefined);
    modelChangedStore.set(model.id, {});
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

export { subscribe, useModelStore, modelStore, useModelChangedStore, useRpcStore, useRpcRequestStore, requestStore };
