const express = require('express');
const { Auth, AuthType } = require('@qlik/sdk');

let prevHost = null;
let prevClientId = null;
let authInstance = null;

const getAuthInstance = (returnToOrigin, host, clientId) => {
  if (authInstance && prevHost === host && prevClientId == clientId) {
    console.log('++++++++++++++++++++++++++++++++++++++++++');
    console.log('[webpack_srv]: reusing same auth instance!', host, clientId);
    console.log('++++++++++++++++++++++++++++++++++++++++++');
    return authInstance;
  }

  console.log('==========================================');
  console.log('[webpack_srv]: creating new auth instance!', host, clientId);
  console.log('==========================================');
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

const OAuthRouter = function () {
  const router = express.Router();

  let cachedHost = null;
  let cachedClientId = null;

  router.get('/oauth', async (req, res) => {
    const { host: qHost, clientId: qClientId } = req.query;
    console.log('[webpack_srv] /oauth', { qHost, qClientId });
    if (!cachedHost && !cachedClientId) {
      cachedHost = qHost;
      cachedClientId = qClientId;
    }

    const returnTo = `${req.protocol}://${req.get('host')}`;
    const instacne = getAuthInstance(returnTo, qHost, qClientId);
    const isAuthorized = await instacne.isAuthorized();
    console.log('[webpack_srv] INSTANCE', { isAuthorized });
    if (!isAuthorized) {
      console.log('[webpack_srv] NOT AUTHORIZED');
      const { url: redirectUrl } = await instacne.generateAuthorizationUrl();
      console.log('[webpack_srv]', { redirectUrl });
      res.status(200).json({ redirectUrl });
      // res.redirect(redirectUrl);
    } else {
      console.log('[webpack_srv] : AUTHORIZED');
      const redirectUrl = `${req.protocol}://${req.get(
        'host'
      )}/app-list?engine_url=wss://${cachedHost}&qlik-client-id=${cachedClientId}&shouldFetchAppList=true`;
      cachedHost = null;
      cachedClientId = null;
      res.redirect(redirectUrl);
    }
  });

  router.get('/login/callback', async (req, res) => {
    const authLink = new URL(req.url, `http://${req.headers.host}`).href;
    try {
      // TODO:
      // this is a temp fix in front end side
      // (temp workaround of not presisting origin while backend tries to authorize user)
      // they need to handle this in qlik-sdk-typescript repo
      // and will notify us about when they got fixed it,
      // but until then, we need to take care of it here!
      authInstance.rest.interceptors.request.use((_req) => {
        // eslint-disable-next-line no-param-reassign, dot-notation
        _req[1]['headers'] = { origin: 'http://localhost:8000' };
        return _req;
      });
      console.log('[webpack_srv] [login/callback/] success', { cachedHost, cachedClientId });
      await authInstance.authorize(authLink);
      // res.redirect(301, '/auth/oauth/');
      res.redirect(301, `/auth/oauth?host=${cachedHost}&clientId=${cachedClientId}`);
    } catch (err) {
      console.log('[webpack_srv] [login/callback/] error');
      console.log({ err });
      res.status(401).send(JSON.stringify(err, null, 2));
    }
  });

  router.get('/deauthorize', async (req, res) => {
    try {
      authInstance = null;
      prevHost = null;
      prevClientId = null;

      cachedClientId = null;
      cachedHost = null;
      const result = await authInstance?.deauthorize();
      console.log('-----------------------------------');
      console.log('[webpack_srv] DEAUTHORIZING', result, authInstance);
      console.log('-----------------------------------');

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

const getAvailableAuthInstance = () => {
  return authInstance;
};

module.exports = { OAuthRouter, getAvailableAuthInstance };
