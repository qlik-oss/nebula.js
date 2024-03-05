import enigma from 'enigma.js';
import qixSchema from 'enigma.js/schemas/12.1657.0.json';
import SenseUtilities from 'enigma.js/sense-utilities';
import { Auth, AuthType } from '@qlik/sdk';

const getParams = () => {
  const opts = {};
  window.location.search
    .substring(1)
    .split('&')
    .forEach((pair) => {
      const idx = pair.indexOf('=');
      const name = pair.substr(0, idx);
      let value = decodeURIComponent(pair.substring(idx + 1));
      if (name === 'cols') {
        value = value.split(',');
      }
      opts[name] = value;
    });
  return opts;
};

// These URLS are fully constructed later using the sdk
// QCS:       wss://<tenant-url>.<region>.qlikcloud.com/app/<app-GUID>
// QSEoW:     wss://<host>/<virtual-proxy-prefix>/app/<app-GUID>

// matches the wss://<host>/<virtual-proxy-prefix>/
const urlRegex = /(wss?):\/\/([^/:?&]+)(?::(\d+))?/;
const appRegex = /\/app\/([^?&#:]+)/;
// The prefix must be unique for all virtual proxies used by the same proxy service,
// as this differentiates the virtual proxies and will be a part of the URL (https://[node]/[prefix]/).
// Valid characters for prefix are "a-z", "0-9", "-", ".", "_", "~".
const prefixRegx = /(wss?):\/\/([^/:?&]+)(?::(\d+))?\/?([a-z0-9-._~]+)?/;

const parseEngineURL = (url) => {
  const match = urlRegex.exec(url);
  if (!match) {
    return {
      engineUrl: url,
      invalid: true,
    };
  }

  let appId;
  const trimmedUrl = url.trim();
  let engineUrl = trimmedUrl;
  let appUrl;

  const appMatch = appRegex.exec(trimmedUrl);

  if (appMatch) {
    [, appId] = appMatch;
    engineUrl = trimmedUrl.substring(0, appMatch.index);
    appUrl = trimmedUrl;
  }

  const engineMatch = prefixRegx.exec(engineUrl);

  if (!engineMatch) {
    return {
      engineUrl: url,
      invalid: true,
    };
  }
  return {
    enigma: {
      secure: match[1] === 'wss',
      host: match[2],
      port: match[3] || undefined,
      prefix: engineMatch[4] || undefined,
      appId,
    },
    engineUrl,
    appUrl,
  };
};

const getConnectionInfo = () =>
  fetch('/info')
    .then((response) => response.json())
    .then(async (n) => {
      let info = n;
      const params = getParams();
      if (params.engine_url) {
        info = {
          ...info,
          // TODO:
          // instead of calling "/info" and then parsing url inside of `getConnectionInfo()`
          // we can have a hook which listens on location.search and provides this information for us
          ...parseEngineURL(params.engine_url),
        };
      } else if (params.app) {
        info = {
          ...info,
          enigma: {
            ...info.enigma,
            appId: params.app,
          },
        };
      }
      if (params['qlik-web-integration-id']) {
        info.webIntegrationId = params['qlik-web-integration-id'];
      }
      if (params['qlik-client-id']) {
        info.clientId = params['qlik-client-id'];
      }
      if (info.invalid) {
        return info;
      }
      const rootPath = `${info.enigma.secure ? 'https' : 'http'}://${info.enigma.host}`;
      return {
        ...info,
        rootPath,
      };
    });

const getAuthInstance = async ({ webIntegrationId, host }) => {
  const authInstance = new Auth({
    webIntegrationId,
    autoRedirect: true,
    authType: AuthType.WebIntegration,
    host,
  });
  const isAuth = await authInstance.isAuthenticated();
  if (!isAuth) await authInstance.authenticate();
  return authInstance;
};

const connect = async () => {
  try {
    const {
      clientId,
      webIntegrationId,
      enigma: enigmaInfo,
      enigma: { host },
    } = await getConnectionInfo();

    // if no clientId + user is already authorized -> deAuthorize user
    const { isAuthorized } = await (await fetch('/isAuthorized')).json();
    if (!clientId && isAuthorized) {
      await (await fetch('/deauthorize')).json();
    }

    if (webIntegrationId) {
      const authInstance = await getAuthInstance({ webIntegrationId, host });
      return {
        getDocList: async () => {
          const url = `/items?resourceType=app&limit=30&sort=-updatedAt`;
          const { data = [] } = await (await authInstance.rest(url)).json();
          return data.map((d) => ({
            qDocId: d.resourceId,
            qTitle: d.name,
          }));
        },
        getConfiguration: async () => ({}),
      };
    }

    if (clientId) {
      return {
        getDocList: async () => {
          const resp = await (await fetch(`/oauth?host=${host}&clientId=${clientId}`)).json();
          if (resp.redirectUrl) window.location.href = resp.redirectUrl;
        },
        getConfiguration: async () => ({}),
      };
    }

    const url = SenseUtilities.buildUrl({
      secure: false,
      ...enigmaInfo,
    });

    return enigma.create({ schema: qixSchema, url }).open();
  } catch (error) {
    throw new Error('Failed to return enigma instance');
  }
};

const openApp = async (id) => {
  try {
    const {
      clientId,
      webIntegrationId,
      enigma: enigmaInfo,
      enigma: { host },
    } = await getConnectionInfo();

    let url = '';
    if (webIntegrationId) {
      const authInstance = await getAuthInstance({ webIntegrationId, host });
      url = await authInstance.generateWebsocketUrl(id);
    } else if (clientId) {
      const { webSocketUrl } = await (await fetch(`/getSocketUrl/${id}`)).json();
      url = webSocketUrl;
    } else {
      url = SenseUtilities.buildUrl(enigmaInfo);
    }

    const enigmaGlobal = await enigma.create({ schema: qixSchema, url }).open();
    return enigmaGlobal.openDoc(id);
  } catch (error) {
    throw new Error('Failed to open app!');
  }
};

export { connect, openApp, getParams, getConnectionInfo, getAuthInstance, parseEngineURL };
