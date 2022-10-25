export const getAppLink = ({ navigate, location, appData, treatAsDesktop, engineUrl }) => {
  // TODO:
  // use location information from react-router
  const search = location.search;
  const newEngineUrl = `${engineUrl}/app/${encodeURIComponent(treatAsDesktop ? appData.qDocName : appData.qDocId)}`;
  const modifiedEngineUrl = search.replace(engineUrl, newEngineUrl);

  // return `/dev/${modifiedEngineUrl}`.replace('&shouldFetchAppList=true', '');
  // navigate(`/dev/${modifiedEngineUrl}`.replace('&shouldFetchAppList=true', ''));
  navigate(`/develop/${modifiedEngineUrl}`.replace('&shouldFetchAppList=true', ''));
};

export const goToApp = (value) => {
  window.location.href = `${window.location.origin}?engine_url=${value.replace('?', '&')}`;
};
