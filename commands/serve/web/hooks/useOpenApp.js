import { useState, useEffect } from 'react';
import { openAppSession } from '@qlik/api/qix';

export const useOpenApp = ({ info }) => {
  const [app, setApp] = useState(null);
  const [waiting, setWaiting] = useState(true);

  useEffect(() => {
    setWaiting(true);
    if (!info) return;
    handleOpenApp()
      .then((resultApp) => setApp(resultApp))
      .catch((err) => console.log(err))
      .finally(() => setWaiting(false));
  }, [info]);

  const handleOpenApp = async () => {
    try {
      const { clientId, webIntegrationId, engine: engineConfig = null, engine: { host } = {} } = info;
      const appId = info?.engine?.appId;
      if (!appId) throw new Error('Missing appId in connection info');

      if (webIntegrationId) {
        return openAppSession({
          appId,
          hostConfig: { authType: 'cookie', webIntegrationId, host },
        }).getDoc();
      }

      if (clientId) {
        return openAppSession({
          appId,
          hostConfig: {
            authType: 'oauth2',
            clientId,
            host,
            redirectUri: `${window.location.origin}/auth/login/callback`,
            accessTokenStorage: 'session',
          },
        }).getDoc();
      }

      // Local / no-auth engine (e.g. qlik-core, docker engine)
      const scheme = engineConfig.secure !== false ? 'https' : 'http';
      const localHost = `${scheme}://${engineConfig.host}${engineConfig.port ? `:${engineConfig.port}` : ''}`;
      return openAppSession({
        appId,
        hostConfig: { authType: 'noauth', host: localHost },
      }).getDoc();
    } catch (error) {
      throw new Error('Failed to open app!', { cause: error });
    }
  };

  return { waiting, app, setApp };
};
