import { useState, useEffect } from 'react';
import enigma from 'enigma.js';
import qixSchema from 'enigma.js/schemas/12.2015.0.json';
import SenseUtilities from 'enigma.js/sense-utilities';
import { getAuthInstance } from '../connect';
import getCsrfToken from '../utils/getCsrfToken';

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
      const { clientId, webIntegrationId, enigma: enigmaInfo = null, enigma: { host } = {} } = info;

      let url = '';
      if (webIntegrationId) {
        const authInstance = await getAuthInstance({ webIntegrationId, host });
        url = await authInstance.generateWebsocketUrl(info?.enigma.appId);
      } else if (clientId) {
        const { webSocketUrl } = await (await fetch(`/auth/getSocketUrl/${info?.enigma.appId}`)).json();
        url = webSocketUrl;
      } else {
        const csrfToken = await getCsrfToken(
          `https://${enigmaInfo.host}${enigmaInfo.prefix ? `/${enigmaInfo.prefix}` : ''}`
        );
        url = SenseUtilities.buildUrl({ ...enigmaInfo, ...{ urlParams: { 'qlik-csrf-token': csrfToken } } });
      }

      const enigmaGlobal = await enigma.create({ schema: qixSchema, url }).open();
      return enigmaGlobal.openDoc(info?.enigma.appId);
    } catch (error) {
      throw new Error('Failed to open app!');
    }
  };

  return { waiting, app, setApp };
};
