import getCsrfToken from './getCsrfToken';

export const getAppLink = async ({ navigate, location, targetApp, info }) => {
  const { search } = location;
  const protocol = info.enigma.secure ? 'wss' : 'ws';
  const port = info.enigma.port ? `:${info.enigma.port}` : '';
  const prefix = info.enigma.prefix ? `/${info.enigma.prefix}` : '';
  const host = (info.enigma.host === 'localhost' ? `${info.enigma.host}${port}` : info.enigma.host) + prefix;

  const csrfToken = await getCsrfToken(`https://${info.enigma.host}${prefix}`);
  const csrfQuery = csrfToken ? `&qlik-csrf-token=${csrfToken}` : '';

  const newEngineUrl = `${protocol}://${host}/app/${encodeURIComponent(targetApp)}${csrfQuery}`;
  const modifiedEngineUrl = search.replace(info.engineUrl, newEngineUrl);

  navigate(`/dev/${modifiedEngineUrl}`.replace('&shouldFetchAppList=true', ''));
};
