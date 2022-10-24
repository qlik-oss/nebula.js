import { useState, useEffect } from 'react';
import { checkIfAuthorized, getAppList } from '../utils';

export const useAppList = ({ glob, info }) => {
  const [appList, setAppList] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('search', window.location.search, glob, info);
    setLoading(true);
    const searchParam = new URLSearchParams(window.location.search);

    // if is already authorized and does not have "shouldFetchAppList" -> append it to the url
    checkIfAuthorized().then(({ isAuthorized }) => {
      if (isAuthorized && !searchParam.get('shouldFetchAppList')) {
        const url = new URL(window.location.href);
        url.searchParams.append('shouldFetchAppList', true);
        // TODO:
        window.location.href = decodeURIComponent(url.toString());
      }
    });

    (searchParam.get('shouldFetchAppList') ? getAppList() : glob?.getDocList())?.then((apps) => {
      setAppList(apps);
      if (apps) setLoading(false);
    });
  }, [window.location.search, setLoading]);

  return { appList, loading };
};
