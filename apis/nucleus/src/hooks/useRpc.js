import { useReducer, useEffect } from 'react';
import { useModelChangedStore, useRpcResultStore, useRpcRequestStore } from '../stores/modelStore';

// eslint-disable-next-line no-unused-vars
const sleep = (delay) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};

const rpcReducer = (state, action) => {
  const { rpcResultStore, key, method } = action;
  let newState;
  switch (action.type) {
    case 'INVALID': {
      newState = {
        ...state,
        valid: false,
        invalid: true,
        validating: true,
        canCancel: true,
        canRetry: false,
        rpcRetry: false,
      };
      break;
    }
    case 'VALID': {
      newState = {
        result: {
          ...action.result,
        },
        invalid: false,
        valid: true,
        validating: false,
        canCancel: false,
        canRetry: false,
        rpcRetry: false,
      };
      break;
    }
    case 'CANCELLED': {
      newState = {
        invalid: true,
        valid: false,
        validating: false,
        canCancel: false,
        canRetry: true,
        rpcRetry: false,
      };
      break;
    }
    default:
      throw new Error('Undefined action');
  }
  let sharedState = rpcResultStore.get(key);
  if (!sharedState) {
    sharedState = {};
  }
  sharedState[method] = newState;
  rpcResultStore.set(key, sharedState);
  return newState;
};

export default function useRpc(model, method) {
  const key = model ? `${model.id}` : null;
  const [rpcResultStore] = useRpcResultStore();
  const [state, dispatch] = useReducer(rpcReducer, key ? rpcResultStore.get(key) : null);
  const [modelChangedStore] = useModelChangedStore();
  const [rpcRequestStore] = useRpcRequestStore();

  let rpcShared;

  if (key) {
    rpcShared = rpcRequestStore.get(key);
    if (!rpcShared) {
      rpcShared = {};
      rpcRequestStore.set(key, rpcShared);
    }
  }

  const call = async (skipRetry) => {
    let cache = rpcShared[method];
    if (!cache || (cache && cache.rpcRetry)) {
      const rpc = model[method]();
      cache = {
        rpc,
        rpcRetry: false,
      };
      rpcShared[method] = cache;

      dispatch({
        type: 'INVALID',
        method,
        key,
        model,
        rpcResultStore,
        canCancel: true,
      });
    }

    try {
      // await sleep(5000);
      const result = await cache.rpc;
      dispatch({ type: 'VALID', result, key, method, model, rpcResultStore });
    } catch (err) {
      if (err.code === 15 && !skipRetry) {
        // Request aborted. This will be called multiple times by hooks only retry once
        if (!cache.rpcRetry) {
          cache.rpcRetry = true;
        }
        call(true);
      }
    }
  };
  const longrunning = {
    cancel: async () => {
      const global = model.session.getObjectApi({ handle: -1 });
      await global.cancelRequest(rpcShared[method].rpc.requestId);
      dispatch({
        type: 'CANCELLED',
        key,
        method,
        model,
        rpcResultStore,
      });
    },
    retry: () => {
      rpcShared[method].rpcRetry = true;
      call();
    },
  };

  useEffect(() => {
    if (!model) return undefined;

    call();

    return undefined;
  }, [model, modelChangedStore.get(model && model.id), key, method]);

  return [
    // Result
    state && state.result,
    { validating: state && state.validating, canCancel: state && state.canCancel, canRetry: state && state.canRetry },
    // Long running api e.g cancel retry
    longrunning,
  ];
}
