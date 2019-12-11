import useGlobalStore from './useGlobalStore';

const initialState = {
  invalid: true,
  valid: false,
  validating: false,
  cancelled: false,
  cancel: null,
  retry: null,
  layout: null,
};

const actions = {
  INVALID: (state, action) => ({
    ...state,
    validating: true,
    invalid: true,
    valid: false,
    cancel: action.cancel,
  }),
  VALID: (state, action) => ({
    ...state,
    validating: false,
    valid: true,
    invalid: false,
    cancel: null,
    retry: null,
    layout: action.layout,
  }),
  CANCELLED: (state, action) => ({
    ...state,
    validating: false,
    invalid: true,
    valid: false,
    cancelled: true,
    retry: action.retry,
  }),
};
const reducer = (state, action) => actions[action.type](state, action);

const getLayout = ({ dispatch, model }) => {
  let canCancel = true;
  const rpc = model.getLayout();
  canCancel = false;
  dispatch({
    type: 'INVALID',
    cancel: async () => {
      if (canCancel) {
        const global = model.session.getObjectApi({ handle: -1 });
        await global.cancelRequest(rpc.requestId);
        dispatch({
          type: 'CANCELLED',
          retry: () => getLayout({ dispatch, model })(),
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
    } catch (err) {
      // TODO - this can happen for requested aborted
      // console.info(err);
    }
  };
};

const useLayout = model => {
  const key = model ? `${model.session.id}/${model.id}` : null;
  const [state, dispatch, subscribe] = useGlobalStore({
    key,
    reducer,
    initialState,
  });
  // This will only be called for first subscriber (e.g useLayout call)
  subscribe(() => {
    const onChanged = () => {
      getLayout({ dispatch, model })();
    };
    model.on('changed', onChanged);
    onChanged();
    // This will only be called for last subscriber (e.g useLayout call)
    return () => {
      model.removeListener('changed', onChanged);
    };
  });
  return [state];
};
export default useLayout;
