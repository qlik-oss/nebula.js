import { useState, useEffect } from 'react';
import { checkIfAuthorized, getAppList } from '../utils';

export const useAppList = ({ glob }) => {
  const [appList, setAppList] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const searchParam = new URLSearchParams(window.location.search);

    // if is already authorized and does not have "shouldFetchAppList" -> append it to the url
    checkIfAuthorized().then(({ isAuthorized }) => {
      if (isAuthorized && !searchParam.get('shouldFetchAppList')) {
        const url = new URL(window.location.href);
        url.searchParams.append('shouldFetchAppList', true);
        window.location.href = decodeURIComponent(url.toString());
      }
    });

    (searchParam.get('shouldFetchAppList') ? getAppList() : glob.getDocList()).then((apps) => {
      setAppList(apps);
      if (apps) setLoading(false);
    });
  }, [window.location.search, setLoading]);

  return { appList, loading };
};
