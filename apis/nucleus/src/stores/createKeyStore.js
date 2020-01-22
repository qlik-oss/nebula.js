import { useState, useEffect } from 'react';

export default (initialState, applyMiddleware = () => {}) => {
  const sharedState = initialState;
  const hookListeners = [];

  const store = {
    get: key => sharedState[key],
    set: (key, value) => {
      if (typeof key === 'undefined' || typeof key === 'object') {
        throw new Error(`Invalid key: ${JSON.stringify(key)}`);
      }
      // console.log('overwriting', key, value);
      sharedState[key] = value;
      applyMiddleware({ type: 'SET', value });
      return value;
    },
    dispatch: forceNewState => {
      // console.log('before dispatch', +new Date(), hookListeners.length);
      hookListeners.forEach(listener => listener(forceNewState ? {} : sharedState));
      // console.log('after dispatch', +new Date());
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
