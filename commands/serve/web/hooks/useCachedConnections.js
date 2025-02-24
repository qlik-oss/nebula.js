import { useState } from 'react';

export const useCachedConnections = ({ storage }) => {
  const [cachedConnections, setCachedConnections] = useState(storage.get('connections') || []);

  const removeCachedConnection = (li) => {
    const idx = cachedConnections.indexOf(li);
    if (li !== -1) {
      const conns = cachedConnections.slice();
      conns.splice(idx, 1);
      storage.save('connections', conns);
      setCachedConnections(conns);
    }
  };

  const addCachedConnections = ({ info }) => {
    let url = '';
    const protocol = info.enigma.secure ? 'wss' : 'ws';
    const host = info.enigma.host === 'localhost' ? `${info.enigma.host}:${info.enigma.port}` : info.enigma.host;
    const prefix = info.enigma.prefix ? `/${info.enigma.prefix}` : '';
    const engineUrl = `${protocol}://${host}${prefix}`;

    if (info.clientId) {
      url = `${engineUrl}/?qlik-client-id=${info.clientId}`;
    } else if (info.webIntegrationId) {
      url = `${engineUrl}/?qlik-web-integration-id=${info.webIntegrationId}`;
    } else {
      url = engineUrl;
    }
    if (cachedConnections.indexOf(url) === -1 && url.length !== 0) {
      const newConns = [...cachedConnections, url];
      storage.save('connections', newConns);
      setCachedConnections(newConns);
    }
  };

  return { cachedConnections, removeCachedConnection, addCachedConnections };
};
