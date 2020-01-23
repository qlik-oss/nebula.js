import { useReducer, useEffect } from 'react';
import { useModelChangedStore, useRpcStore, useRpcRequestStore } from '../stores/modelStore';

// eslint-disable-next-line no-unused-vars
const sleep = delay => {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
};

const rpcReducer = (state, action) => {
  const { store, key, method } = action;
  let newState;
  switch (action.type) {
    case 'INVALID': {
      newState = {
        ...state,
        valid: false,
        invalid: true,
        validating: true,
        canCancel: true,
      };
      break;
    }
    case 'VALID': {
      newState = {
        result: {
          // ...state.result,
          ...action.result,
        },
        invalid: false,
        valid: true,
        validating: false,
        canCancel: false,
        canRetry: false,
      };
      break;
    }
    case 'CANCELLED': {
      newState = {
        invalid: true,
        valid: false,
        validating: false,
        canRetry: true,
        canCancel: false,
      };
      break;
    }
    default:
      throw new Error('Undefined action');
  }
  let sharedState = store.get(key);
  if (!sharedState) {
    sharedState = {};
    // console.log('init state', action.model.handle);
  }
  sharedState[method] = newState;
  // console.log(action.model.handle, method, sharedState, newState);
  store.set(key, sharedState);
  return newState;
};

export default function useRpc(model, method) {
  const key = model ? `${model.id}` : null;
  const [store] = useRpcStore();
  const [state, dispatch] = useReducer(rpcReducer, key ? store.get(key) : null);
  const [modelChangedStore] = useModelChangedStore();
  const [requestStore] = useRpcRequestStore();
  // console.log('userpc');
  useEffect(() => {
    if (!model) return undefined;
    // const rpcKey = `${key}/${method}`;
    // let rpc = requestStore.get(rpcKey);
    let rpcShared = requestStore.get(key);
    // console.log('rpcShared', rpcShared);
    if (!rpcShared) {
      rpcShared = {};
      requestStore.set(key, rpcShared);
      // console.log('init rpc');
    }

    const call = async skipRetry => {
      let rpc = rpcShared[method];
      if (!rpc) {
        rpc = model[method]();
        rpcShared[method] = rpc;

        dispatch({
          type: 'INVALID',
          method,
          key,
          model,
          store,
          canCancel: true,
        });
      } else {
        // console.log('ongoing');
        // return;
      }
      try {
        // await sleep(5000);
        const result = await rpc;
        dispatch({ type: 'VALID', result, key, method, model, store });
      } catch (err) {
        if (err.code === 15 && !skipRetry) {
          // Request aborted. This will be called multiple times by hooks only retry once
          // console.log('retry');
          rpcShared[method] = null;
          call(true);
        }
      }
    };
    call();

    return undefined;
  }, [model, modelChangedStore.get(model && model.id), key, method]);

  // console.log(model && model.handle, state);

  return [
    // Result
    // state && state[method] && state[method].result,
    state && state.result,
    // {
    //   validating: state && state[method] && state[method].validating,
    //   canCancel: state && state[method] && state[method].canCancel,
    //   canRetry: state && state[method] && state[method].canRetry,
    // },
    { validating: state && state.validating, canCancel: state && state.canCancel, canRetry: state && state.canRetry },
    // Long running api e.g cancel retry
    // longrunning,
  ];
}
