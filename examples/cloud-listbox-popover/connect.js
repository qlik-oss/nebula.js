import enigma from 'enigma.js';
import schema from 'enigma.js/schemas/12.1657.0.json';
import { Auth, AuthType } from '@qlik/sdk';

// Replace these with your own values — see README for instructions
const TENANT = '';
const WEB_INTEGRATION_ID = '';
const APP_ID = '';

export default async function connect() {
  const auth = new Auth({
    authType: AuthType.WebIntegration,
    autoRedirect: true,
    host: TENANT,
    webIntegrationId: WEB_INTEGRATION_ID,
  });

  if (!auth.isAuthenticated()) {
    auth.authenticate();
    return null;
  }

  const wsUrl = await auth.generateWebsocketUrl(APP_ID);
  const global = await enigma.create({ schema, url: wsUrl }).open();
  return global.openDoc(APP_ID);
}
