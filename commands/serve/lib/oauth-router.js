const express = require('express');
const { Auth, AuthType } = require('@qlik/sdk');

let prevHost = null;
let prevClientId = null;
let authInstance = null;

const getAuthInstance = (returnToOrigin, host, clientId) => {
  if (authInstance && prevHost === host && prevClientId === clientId) {
    return authInstance;
  }

  prevHost = host;
  prevClientId = clientId;

  authInstance = new Auth({
    authType: AuthType.OAuth2,
    host,
    clientId,
    redirectUri: `${returnToOrigin}/auth/login/callback`,
  });
  return authInstance;
};

const OAuthRouter = () => {
  const router = express.Router();

  let cachedHost = null;
  let cachedClientId = null;

  router.get('/oauth', async (req, res) => {
    const { host: qHost, clientId: qClientId } = req.query;
    if (!cachedHost && !cachedClientId) {
      cachedHost = qHost;
      cachedClientId = qClientId;
    }

    const returnTo = `${req.protocol}://${req.get('host')}`;
    const instacne = getAuthInstance(returnTo, qHost, qClientId);
    const isAuthorized = await instacne.isAuthorized();
    if (!isAuthorized) {
      const { url: redirectUrl } = await instacne.generateAuthorizationUrl();
      res.status(200).json({ redirectUrl });
    } else {
      const reqHost = req.get('host');
      const redirectUrl = `${req.protocol}://${reqHost}/app-list?engine_url=wss://${cachedHost}&qlik-client-id=${cachedClientId}&shouldFetchAppList=true`;

      cachedHost = null;
      cachedClientId = null;

      res.redirect(redirectUrl);
    }
  });

  router.get('/login/callback', async (req, res) => {
    const authLink = new URL(req.url, `http://${req.headers.host}`).href;
    try {
      // TODO:
      // this is a temp fix in nebula side
      // (temp workaround of not presisting origin while backend tries to authorize user)
      // they need to handle this in qlik-sdk-typescript repo
      // and will notify us about when they got fixed it,
      // but until then, we need to take care of it here!
      authInstance.rest.interceptors.request.use((_req) => {
        // eslint-disable-next-line no-param-reassign, dot-notation
        _req[1]['headers'] = { origin: 'http://localhost:8000' };
        return _req;
      });
      await authInstance.authorize(authLink);
      res.redirect(301, `/auth/oauth?host=${cachedHost}&clientId=${cachedClientId}`);
    } catch (err) {
      console.log({ err });
      res.status(401).send({
        message: 'Auth failed in callback redirecting, based on the provided auth link!',
      });
    }
  });

  router.get('/deauthorize', async (req, res) => {
    try {
      prevHost = null;
      prevClientId = null;
      authInstance = null;

      cachedHost = null;
      cachedClientId = null;
      await authInstance?.deauthorize();

      res.status(200).json({
        deauthorize: true,
      });
    } catch (error) {
      console.log({ error });
    }
  });

  router.get('/isAuthorized', async (req, res) => {
    if (!authInstance) {
      res.status(200).json({
        isAuthorized: false,
      });
    } else {
      const isAuthorized = await authInstance.isAuthorized();
      res.status(200).json({
        isAuthorized,
      });
    }
  });

  router.get('/getSocketUrl/:appId', async (req, res) => {
    const { appId } = req.params;
    const webSocketUrl = await authInstance.generateWebsocketUrl(appId, true);
    res.status(200).json({ webSocketUrl });
  });

  return router;
};

const getAvailableAuthInstance = () => authInstance;

module.exports = { OAuthRouter, getAvailableAuthInstance };
