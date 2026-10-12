import { useState, useEffect } from 'react';

export default (initialState = {}, applyMiddleware = () => {}) => {
  const sharedState = initialState;
  const hookListeners = [];
  const subscribedListeners = {};

  const store = {
    get: (key) => sharedState[key],
    set: (key, value) => {
      if (typeof key === 'undefined' || typeof key === 'object') {
        throw new Error(`Invalid key: ${JSON.stringify(key)}`);
      }
      sharedState[key] = value;
      subscribedListeners[key] = applyMiddleware({ type: 'SET', value });
      return value;
    },
    clear: (key) => {
      if (typeof key === 'undefined' || typeof key === 'object') {
        throw new Error(`Invalid key: ${JSON.stringify(key)}`);
      }
      sharedState[key] = null;
    },
    remove: (key) => {
      if (typeof key === 'undefined' || typeof key === 'object') {
        throw new Error(`Invalid key: ${JSON.stringify(key)}`);
      }
      const unsubscribe = subscribedListeners[key];
      delete subscribedListeners[key];
      // oxlint-disable-next-line no-unused-expressions
      unsubscribe && unsubscribe();
      sharedState[key] = null;
    },
    dispatch: (forceNewState) => {
      hookListeners.forEach((listener) => listener(forceNewState ? {} : sharedState));
    },
    destroy: () => {
      Object.keys(subscribedListeners).forEach((key) => {
        subscribedListeners[key] && subscribedListeners[key]();
      });
    },
  };

  const useKeyStore = () => {
    const [, setState] = useState(sharedState);

    useEffect(() => {
      hookListeners.push(setState);
      return () => {
        const ix = hookListeners.indexOf(setState);
        hookListeners.splice(ix, 1);
      };
    }, [setState]);

    return [store];
  };

  return [useKeyStore, store];
};
