import { useState, useEffect } from 'react';
import { checkIfAuthorized, getAppList } from '../utils';
import { useNavigate } from 'react-router-dom';
import { useRootContext } from '../contexts/RootContext';
import { getConnectionInfo } from '../connect';

export const useAppList = ({ glob, info }) => {
  const navigate = useNavigate();
  const { setInfo, setActiveStep } = useRootContext();
  const [appList, setAppList] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveStep(1);
    getConnectionInfo().then((i) => {
      if (i.enigma.appId) {
        window.location.href = `/dev/${window.location.search}`;
        return;
      }
      setInfo(i);
    });
  }, []);

  useEffect(() => {
    if (appList?.length) return;
    setLoading(true);
    const searchParam = new URLSearchParams(window.location.search);

    // if is already authorized and does not have "shouldFetchAppList" -> append it to the url
    if (searchParam.get('qlik-client-id') && !searchParam.get('shouldFetchAppList')) {
      checkIfAuthorized().then(({ isAuthorized }) => {
        if (isAuthorized) {
          const url = new URL(window.location.href);
          if (!url.search.includes('shouldFetchAppList')) {
            url.searchParams.append('shouldFetchAppList', true);
          }
          navigate(`${url.pathname}${url.search}`);
        }
      });
    }

    (searchParam.get('shouldFetchAppList') ? getAppList() : glob?.getDocList())?.then((apps) => {
      setAppList(apps);
      if (apps) setLoading(false);
    });
  }, [window.location.search, setLoading, info, glob]);

  return { appList, loading };
};
