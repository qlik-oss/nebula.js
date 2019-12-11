import { useEffect, useState } from 'react';

const globalState = {};

const useGlobalStore = ({ key, reducer, initialState }) => {
  // setState is used to subscribe to a store
  const [, setState] = useState();
  const dispatch = payload => {
    // eslint-disable-next-line prefer-const
    let { subscribers, state } = globalState[key];
    const newState = reducer(state, payload);
    state = {
      ...state,
      ...newState,
    };
    globalState[key] = {
      state,
      subscribers,
    };
    subscribers.forEach(s => s(state));
  };

  // Handle hook subscribers
  let cb = () => {};
  let unsubscribe = () => {};
  const subscribe = fn => {
    cb = fn;
  };

  useEffect(() => {
    if (!key) return undefined;
    if (!globalState[key]) {
      globalState[key] = {
        state: {
          ...initialState,
        },
        subscribers: [],
      };
    }
    const { subscribers } = globalState[key];
    subscribers.push(setState);
    if (subscribers.length === 1) {
      unsubscribe = cb();
    }
    return () => {
      const ix = subscribers.indexOf(setState);
      subscribers.splice(ix, 1);
      if (subscribers.length === 0) {
        unsubscribe();
      }
    };
  }, [setState, key]);
  const state = (globalState[key] && globalState[key].state) || initialState;
  return [state, dispatch, subscribe];
};

export default useGlobalStore;
