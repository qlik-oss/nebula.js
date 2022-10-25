export const getAppLink = ({ navigate, location, appData, treatAsDesktop, engineUrl }) => {
  const search = location.search;
  const newEngineUrl = `${engineUrl}app/${encodeURIComponent(treatAsDesktop ? appData.qDocName : appData.qDocId)}`;
  const modifiedEngineUrl = search.replace(engineUrl, newEngineUrl);

  navigate(`/dev/${modifiedEngineUrl}`.replace('&shouldFetchAppList=true', ''));
};

export const goToApp = (value) => {
  window.location.href = `${window.location.origin}?engine_url=${value.replace('?', '&')}`;
};
