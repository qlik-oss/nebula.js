export const getAppLink = ({ appData, treatAsDesktop, engineUrl }) => {
  // TODO:
  // use location information from react-router
  const url = window.location.search;
  const newEngineUrl = `${engineUrl}/app/${encodeURIComponent(treatAsDesktop ? appData.qDocName : appData.qDocId)}`;
  const modifiedEngineUrl = url.replace(engineUrl, newEngineUrl);

  return `/dev/${modifiedEngineUrl}`.replace('&shouldFetchAppList=true', '');
};

export const goToApp = (value) => {
  window.location.href = `${window.location.origin}?engine_url=${value.replace('?', '&')}`;
};
