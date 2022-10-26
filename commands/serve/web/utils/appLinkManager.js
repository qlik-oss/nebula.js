export const getAppLink = ({ navigate, location, targetApp, info }) => {
  const search = location.search;
  const protocol = info.enigma.secure ? 'wss' : 'ws';
  const host = info.enigma.host === 'localhost' ? `${info.enigma.host}:${info.enigma.port}` : info.enigma.host;
  const newEngineUrl = `${protocol}://${host}/app/${encodeURIComponent(targetApp)}`;
  const modifiedEngineUrl = search.replace(info.engineUrl, newEngineUrl);

  navigate(`/dev/${modifiedEngineUrl}`.replace('&shouldFetchAppList=true', ''));
};
