import { useState, useEffect } from 'react';
import { getConnectionInfo } from '../connect';

export const useInfo = () => {
  const [info, setInfo] = useState();

  useEffect(() => {
    getConnectionInfo().then((i) => {
      setInfo(i);
    });
  }, []);

  return { info, setInfo };
};
