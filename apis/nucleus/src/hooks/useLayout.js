import { useReducer, useEffect } from 'react';

// eslint-disable-next-line no-unused-vars
const sleep = delay => {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
};

const layoutReducer = (state, action) => {
  // console.log(action.type);
  switch (action.type) {
    case 'INVALID': {
      return {
        ...state,
        validating: true,
        cancel: action.cancel,
      };
    }
    case 'VALID': {
      return {
        validating: false,
        layout: action.layout,
      };
    }
    case 'CANCELLED': {
      return {
        ...state,
        validating: false,
        cancelled: true,
        retry: action.retry,
      };
    }
    default: {
      throw new Error(`Unhandled type: ${action.type}`);
    }
  }
};
const getLayout = ({ dispatch, app, model }) => {
  let canCancel = true;
  const rpc = model.getLayout();
  canCancel = false;
  dispatch({
    type: 'INVALID',
    cancel: async () => {
      if (canCancel) {
        const global = app.session.getObjectApi({ handle: -1 });
        await global.cancelRequest(rpc.requestId);
        dispatch({
          type: 'CANCELLED',
          retry: () => getLayout({ dispatch, app, model })(),
        });
      }
    },
  });

  return async () => {
    canCancel = true;
    try {
      const layout = await rpc;
      // await sleep(15000);
      canCancel = false;
      dispatch({ type: 'VALID', layout });
    } catch (_) {
      // TODO - this can happen for requested aborted
    }
  };
};

const initialState = {
  validating: false,
  cancelled: false,
  cancel: null,
  retry: null,
  layout: null,
};

export default function useLayout({ app, model }) {
  const [state, dispatch] = useReducer(layoutReducer, initialState);
  const onChanged = () => {
    getLayout({ dispatch, app, model })();
  };
  useEffect(() => {
    if (!model) {
      return undefined;
    }
    model.on('changed', onChanged);
    onChanged({ dispatch, app, model });
    return () => {
      model.removeListener('changed', onChanged);
    };
  }, [model && model.id]);

  return [state.layout, state.validating, state.cancel, state.retry];
}
