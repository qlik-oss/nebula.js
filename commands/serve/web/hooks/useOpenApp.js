import { useState, useEffect } from 'react';
import enigma from 'enigma.js';
import qixSchema from 'enigma.js/schemas/12.2015.0.json';
import SenseUtilities from 'enigma.js/sense-utilities';
import { openAppSession } from '@qlik/api/qix';
import { setHostConfig } from '../connect';
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

      if (webIntegrationId || clientId) {
        setHostConfig({ webIntegrationId, clientId, host });
        const appId = info?.enigma?.appId;
        if (!appId) throw new Error('Missing appId in connection info');
        return openAppSession({ appId }).getDoc();
      }

      const csrfToken = await getCsrfToken(
        `https://${enigmaInfo.host}${enigmaInfo.prefix ? `/${enigmaInfo.prefix}` : ''}`
      );
      const url = SenseUtilities.buildUrl({ ...enigmaInfo, ...{ urlParams: { 'qlik-csrf-token': csrfToken } } });
      const enigmaGlobal = await enigma.create({ schema: qixSchema, url }).open();
      return enigmaGlobal.openDoc(info?.enigma.appId);
    } catch (error) {
      throw new Error('Failed to open app!', { cause: error });
    }
  };

  return { waiting, app, setApp };
};
