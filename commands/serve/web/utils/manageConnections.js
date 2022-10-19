import storageFn from '../storage';

// TODO:
// remove global variable
// for making testing of module much easier
const storage = storageFn({});

export const manageConnections = (info) => {
  const conns = storage.get('connections') || [];
  let url = '';
  if (info.clientId) url = `${info.engineUrl}?qlik-client-id=${info.clientId}`;
  if (info.webIntegrationId) url = `${info.engineUrl}?qlik-web-integration-id=${info.webIntegrationId}`;
  if (conns.indexOf(url) === -1 && url.length !== 0) {
    conns.push(url);
    storage.save('connections', conns);
  }
};
