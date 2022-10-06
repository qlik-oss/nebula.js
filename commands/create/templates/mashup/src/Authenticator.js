import enigma from 'enigma.js';
import schema from 'enigma.js/schemas/12.936.0.json';
import { Auth, AuthType } from '@qlik/sdk';

export default class Authenticator {
  /**
   *
   * @param {String} appId  - application id from sense client
   * @param {Strign} url    - tenant url
   */
  constructor({ appId, url }) {
    this.authInstance = null;
    this.appId = appId;
    this.host = url.replace(/^https?:\/\//, '').replace(/\/?/, '');
  }

  /**
   * gets you the promise of enigma instance for your app
   * based on webIntegrationId
   * @param {Strign} webIntegrationId - your web Integration Id from managment console
   * @returns {Promise<IEnigmaClass>} enigma app promise
   */
  async AuthenticateWithWebIntegrationId({ webIntegrationId }) {
    this.authInstance = new Auth({
      authType: AuthType.WebIntegration,
      autoRedirect: true,
      host: this.host,
      webIntegrationId,
    });

    if (!this.authInstance.isAuthenticated()) {
      this.authInstance.authenticate();
    } else return this.getEnigmaApp();

    return null;
  }

  /**
   * gets you the promise of enigma instance for your app
   * based on clientId
   * @param {Strign} clientId     - your client Id from managment console
   * @param {Strign} redirectUri  - the redirect url while bringing you the code + state, default is `window.location.origin`
   * @returns {Promise<IEnigmaClass>} enigma app promise
   */
  async AuthenticateWithOAuth({ clientId, redirectUri }) {
    this.authInstance = new Auth({
      authType: AuthType.OAuth2,
      host: this.host,
      redirectUri: redirectUri || window.location.origin,
      clientId,
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code')) {
      try {
        await this.authInstance.authorize(window.location.href);
        const url = new URL(window.location);
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        window.history.replaceState(null, null, url);
      } catch (error) {
        console.error({ error });
      }

      return this.getEnigmaApp();
    }

    if (!(await this.authInstance.isAuthorized())) {
      const { url } = await this.authInstance.generateAuthorizationUrl();
      const protocol = url.includes('https://') ? 'https' : 'http';
      window.location = `${protocol}://${url}`;
    }

    return null;
  }

  /**
   * returns a promise of enigma instance
   * @returns {Promise<IEnigmaClass>} enigma app instance promise
   */
  async getEnigmaApp() {
    const url = await this.authInstance.generateWebsocketUrl(this.appId);
    const enigmaGlobal = await enigma.create({ schema, url }).open();
    return enigmaGlobal.openDoc(this.appId);
  }
}
