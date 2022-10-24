import React, { useMemo, createContext, useContext } from 'react';
import { useInfo, useConnection } from '../hooks';
import storageFn from '../storage';

export const rootContextInitialValue = {
  info: {},
};

export const RootContext = createContext(rootContextInitialValue);

export const useRootContext = () => {
  const ctx = useContext(RootContext);
  if (!ctx) throw new Error('RootContext not defined!');
  return ctx;
};

export const RootContextProvider = ({ children }) => {
  const { info } = useInfo();
  const { glob, treatAsDesktop, error, activeStep } = useConnection({ info });
  const storage = useMemo(() => storageFn({}), []);

  const rootContextValue = useMemo(
    () => ({ info, glob, treatAsDesktop, error, activeStep, storage }),
    [info, glob, treatAsDesktop, error, activeStep, storage]
  );

  return <RootContext.Provider value={rootContextValue}>{children}</RootContext.Provider>;
};
