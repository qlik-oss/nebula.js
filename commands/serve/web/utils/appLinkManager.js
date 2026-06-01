import getCsrfToken from './getCsrfToken';

export const getAppLink = async ({ navigate, location, targetApp, info }) => {
  const { search } = location;
  const protocol = info.engine.secure ? 'wss' : 'ws';
  const port = info.engine.port ? `:${info.engine.port}` : '';
  const prefix = info.engine.prefix ? `/${info.engine.prefix}` : '';
  const host = (info.engine.host === 'localhost' ? `${info.engine.host}${port}` : info.engine.host) + prefix;

  const csrfToken = await getCsrfToken(`https://${info.engine.host}${prefix}`);
  const csrfQuery = csrfToken ? `&qlik-csrf-token=${csrfToken}` : '';

  const newEngineUrl = `${protocol}://${host}/app/${encodeURIComponent(targetApp)}${csrfQuery}`;
  const modifiedEngineUrl = search.replace(info.engineUrl, newEngineUrl);

  navigate(`/dev/${modifiedEngineUrl}`.replace('&shouldFetchAppList=true', ''));
};
