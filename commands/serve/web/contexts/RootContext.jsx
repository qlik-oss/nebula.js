import React, { useMemo, createContext, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();
  const storage = useMemo(() => storageFn({}), []);
  const { info, setInfo } = useInfo();
  const connectionData = useConnection({ info });

  useEffect(() => {
    if (connectionData.error) navigate('/');

    if (location.pathname === '/') {
      connectionData.setActiveStep(0);
      connectionData.setGlobal();
      connectionData.setTreatAsDesktop(false);
    }
  }, [location.pathname, connectionData.error]);

  const rootContextValue = useMemo(
    () => ({ info, setInfo, ...connectionData, storage }),
    [info, setInfo, connectionData, storage]
  );

  return <RootContext.Provider value={rootContextValue}>{children}</RootContext.Provider>;
};
