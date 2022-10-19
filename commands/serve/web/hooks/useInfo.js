import { useState, useEffect } from 'react';
import { getConnectionInfo } from '../connect';

export const useInfo = () => {
  const [info, setInfo] = useState();

  useEffect(() => {
    getConnectionInfo().then((i) => {
      if (i.enigma.appId) {
        window.location.href = `/dev/${window.location.search}`;
        return;
      }
      setInfo(i);
    });
  }, []);

  return { info };
};
