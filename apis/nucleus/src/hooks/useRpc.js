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

const call = ({ dispatch, model, store, key, method, params, requestStore }) => {
  const rpc = requestStore.get(key) || model[method].apply(model, ...params);
  requestStore.set(key, rpc);
  dispatch({
    type: 'INVALID',
    model,
    store,
    canCancel: true,
  });
  return async () => {
    try {
      // await sleep(10000);
      const result = await rpc;
      dispatch({ type: 'VALID', result, model, store });
    } catch (err) {
      // TODO - this can happen for requested aborted
      // console.info(err);
    } finally {
      requestStore.set(key, undefined);
    }
  };
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
  const key = model ? `${model.id}-${method}` : null;
  const [store] = useRpcStore();
  const storedState = store.get(key);
  const [state, dispatch] = useReducer(rpcReducer, storedState || initialState);
  const [modelChangedStore] = useModelChangedStore();
  const [requestStore] = useRpcRequestStore();

  useEffect(() => {
    if (!model) return;
    // Special case, the state might be updated through the store
    if (storedState === state && (state.valid || state.validating)) {
      return;
    }
    call({ dispatch, model, store, key, method, params, requestStore })();
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
    retry: () => call({ dispatch, model, store, key, method, params, requestStore })(),
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
