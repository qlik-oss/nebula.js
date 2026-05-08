import { useState, useEffect } from 'react';
import { useRootContext } from '../contexts/RootContext';
import { getConnectionInfo } from '../connect';

export const useAppList = ({ glob, info }) => {
  const { setInfo, setActiveStep } = useRootContext();
  const [appList, setAppList] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveStep(1);
    getConnectionInfo().then((i) => {
      setInfo(i);
    });
  }, []);

  useEffect(() => {
    if (appList?.length) return;
    setLoading(true);

    glob
      ?.getDocList()
      ?.then((apps) => {
        setAppList(apps);
        if (apps) setLoading(false);
      })
      ?.catch((err) => {
        console.error('Failed to fetch app list:', err);
        setLoading(false);
      });
  }, [info, glob]);

  return { appList, loading };
};
