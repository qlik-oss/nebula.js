import { useState, useEffect } from 'react';

export default (initialState = {}, applyMiddleware = () => {}) => {
  const sharedState = initialState;
  const hookListeners = [];
  const subscribedListeners = {};

  const store = {
    get: (key) => sharedState[key],
    getAllKeys: () => Object.keys(sharedState),
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
    dispatch: (forceNewState) => {
      hookListeners.forEach((listener) => listener(forceNewState ? {} : sharedState));
    },
    destroy: () => {
      Object.keys(subscribedListeners).forEach((key) => {
        subscribedListeners[key]();
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
