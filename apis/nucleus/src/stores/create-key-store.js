import { useState, useEffect } from 'react';

export default (initialState = {}, applyMiddleware = () => {}) => {
  const sharedState = initialState;
  const hookListeners = [];

  const store = {
    get: (key) => sharedState[key],
    set: (key, value) => {
      if (typeof key === 'undefined' || typeof key === 'object') {
        throw new Error(`Invalid key: ${JSON.stringify(key)}`);
      }
      sharedState[key] = value;
      applyMiddleware({ type: 'SET', value });
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
