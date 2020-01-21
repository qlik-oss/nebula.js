import { useReducer, useEffect } from 'react';
import { useModelChangedStore, useRpcStore, useRpcRequestStore } from '../stores/modelStore';

// eslint-disable-next-line no-unused-vars
const sleep = delay => {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
};

const rpcReducer = (state, action) => {
  let newState;
  switch (action.type) {
    case 'INVALID': {
      newState = {
        ...state,
        invalid: true,
        validating: true,
        canCancel: true,
      };
      break;
    }
    case 'VALID': {
      newState = {
        invalid: false,
        valid: true,
        validating: false,
        result: action.result,
        canCancel: false,
        canRetry: false,
      };
      break;
    }
    case 'CANCELLED': {
      newState = {
        ...state,
        invalid: true,
        valid: false,
        validating: false,
        canRetry: true,
        canCancel: false,
      };
      break;
    }
    default:
      throw new Error(`Unhandled type: ${action.type}`);
  }
  const { store, model } = action;
  store.set(model.id, newState);
  return newState;
};

const call = async ({ dispatch, model, store, key, method, params, requestStore }) => {
  let rpc = requestStore.get(key);
  if (!rpc) {
    rpc = {};
  }
  if (!rpc[method]) {
    rpc[method] = model[method].apply(model, ...params);
    requestStore.set(key, rpc);
    dispatch({
      type: 'INVALID',
      model,
      store,
      canCancel: true,
    });
  }

  try {
    // await sleep(100);
    const result = await rpc[method];
    dispatch({ type: 'VALID', result, model, store });
  } catch (err) {
    // We can end up here multiple times for request aborted
    // Only retry the first time
    const newRpc = requestStore.get(key);
    if (newRpc[method] && newRpc[method] === rpc[method]) {
      newRpc[method] = null;
      requestStore.set(key, newRpc);
    }
    call({ dispatch, model, store, key, method, params, requestStore });
  }
};

const initialState = {
  invalid: false,
  valid: false,
  validating: false,
  canCancel: false,
  canRetry: false,
  result: null,
};

export default function useRpc(model, method, ...params) {
  const key = model ? `${model.id}` : null;
  const [store] = useRpcStore();
  const storedState = store.get(key);
  const [state, dispatch] = useReducer(rpcReducer, storedState || initialState);
  const [modelChangedStore] = useModelChangedStore();
  const [requestStore] = useRpcRequestStore();

  useEffect(() => {
    if (!model) return undefined;
    call({ dispatch, model, store, key, method, params, requestStore });
    return undefined;
  }, [model, modelChangedStore.get(model && model.id)]);

  const longrunning = {
    cancel: async () => {
      const rpc = requestStore.get(key);
      const global = model.session.getObjectApi({ handle: -1 });
      await global.cancelRequest(rpc.requestId);
      dispatch({
        model,
        store,
        type: 'CANCELLED',
      });
    },
    retry: () => call({ dispatch, model, store, key, method, params, requestStore }),
  };

  return [
    // Result
    state.result,
    // Result state
    { validating: state.validating, canCancel: state.canCancel, canRetry: state.canRetry },
    // Long running api e.g cancel retry
    longrunning,
  ];
}
