import { useState, useEffect } from 'react';
import { getAuthInstance } from '../connect';
import SenseUtilities from 'enigma.js/sense-utilities';
import enigma from 'enigma.js';
import qixSchema from 'enigma.js/schemas/12.936.0.json';

export const useOpenApp = ({ info }) => {
  const [app, setApp] = useState(null);
  const [waiting, setWaiting] = useState(true);

  useEffect(() => {
    setWaiting(true);
    if (!info) return;
    handleOpenApp(info)
      .then((resultApp) => {
        setApp(resultApp);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setWaiting(false);
      });
  }, [info]);

  const handleOpenApp = async (info) => {
    try {
      const {
        clientId: clientId = null,
        webIntegrationId: webIntegrationId = null,
        enigma: enigmaInfo = null,
        enigma: { host } = {},
      } = info;

      let url = '';
      if (webIntegrationId) {
        const authInstance = await getAuthInstance({ webIntegrationId, host });
        url = await authInstance.generateWebsocketUrl(info?.enigma.appId);
      } else if (clientId) {
        const { webSocketUrl } = await (await fetch(`/getSocketUrl/${info?.enigma.appId}`)).json();
        url = webSocketUrl;
      } else {
        url = SenseUtilities.buildUrl(enigmaInfo);
      }

      const enigmaGlobal = await enigma.create({ schema: qixSchema, url }).open();
      return enigmaGlobal.openDoc(info?.enigma.appId);
    } catch (error) {
      console.error({ error });
      throw new Error('Failed to open app!');
    }
  };

  return { waiting, app, setApp };
};
