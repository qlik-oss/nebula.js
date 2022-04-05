import { useCallback, useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import enigmaSettingsAtom from '../atoms/enigmaSettingsAtom';
import config from './config.json';

const schema = require('enigma.js/schemas/12.612.0.json');
const enigma = require('enigma.js');
const SessionUtilities = require('enigma.js/sense-utilities');

const useConnectToApp = (connectionRequested) => {
  const enigmaSettings = useAtomValue(enigmaSettingsAtom);
  const [connection, setConnection] = useState(undefined);

  const doOpenApp = useCallback(async () => {
    let app;
    let model;
    let layout;
    let error;
    console.log(enigmaSettings);
    try {
      if (!enigmaSettings) return;
      const url = SessionUtilities.buildUrl({
        host: enigmaSettings.tenantURL,
        port: config.port,
        secure: config.secure,
        ttl: config.ttl,
        route: `app/${enigmaSettings.appId}`,
      });

      const headers = enigmaSettings.apiKey ? { headers: { Authorization: `Bearer ${enigmaSettings.apiKey}` } } : {};
      const connecticonfig = {
        schema,
        url: encodeURI(url),
        createSocket: (_url) => new WebSocket(_url, null, headers),
      };

      const globalSession = await enigma.create(connecticonfig);
      const session = await globalSession.open();
      app = await session.openDoc(enigmaSettings.appId);
      globalSession.close();
    } catch (err) {
      error = err;
    }
    setConnection({ app, error });
  }, [enigmaSettings]);

  useEffect(() => {
    if (!connectionRequested) return;
    doOpenApp();
  }, [doOpenApp, enigmaSettings]);

  return connection;
};

export default useConnectToApp;
