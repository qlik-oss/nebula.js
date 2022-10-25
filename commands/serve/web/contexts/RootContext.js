import React, { useMemo, createContext, useContext, useEffect } from 'react';
import { useInfo, useConnection } from '../hooks';
import storageFn from '../storage';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const { info, setInfo } = useInfo();
  const { glob, setGlobal, treatAsDesktop, setTreatAsDesktop, error, setError, activeStep, setActiveStep } =
    useConnection({ info });
  const storage = useMemo(() => storageFn({}), []);

  useEffect(() => {
    if (error) navigate('/');

    if (location.pathname === '/') {
      setActiveStep(0);
      setGlobal();
      setTreatAsDesktop(false);
    }
  }, [location.pathname, error]);

  const rootContextValue = useMemo(
    () => ({ info, setInfo, glob, setGlobal, treatAsDesktop, error, setError, activeStep, setActiveStep, storage }),
    [info, setInfo, glob, setGlobal, treatAsDesktop, error, setError, activeStep, setActiveStep, storage]
  );

  return <RootContext.Provider value={rootContextValue}>{children}</RootContext.Provider>;
};
